async function getNextSequence(db, sequenceId) {
  const counters = db.collection('counters');
  const result = await counters.findOneAndUpdate(
    { _id: sequenceId },
    { $inc: { sequence_value: 1 }, $setOnInsert: { sequence_value: 0 } },
    { upsert: true, returnDocument: 'after' }
  );

  const sequenceValue = result?.value?.sequence_value;
  return typeof sequenceValue === 'number' ? sequenceValue : 1;
}

async function getDailyBatchId(db) {
  const counters = db.collection('counters');
  const today = new Date();
  const dateKey = today.toISOString().slice(0, 10);

  const result = await counters.findOneAndUpdate(
    { _id: 'batchId' },
    [
      {
        $set: {
          sequence_value: {
            $cond: [
              { $eq: ['$lastDate', dateKey] },
              { $ifNull: ['$sequence_value', 1] },
              { $add: [{ $ifNull: ['$sequence_value', 0] }, 1] }
            ]
          },
          lastDate: dateKey
        }
      }
    ],
    { upsert: true, returnDocument: 'after' }
  );

  if (result?.value?.sequence_value) {
    return result.value.sequence_value;
  }

  // Fallback for drivers/environments that return null on first upsert
  await counters.updateOne(
    { _id: 'batchId' },
    { $set: { lastDate: dateKey, sequence_value: 1 } },
    { upsert: true }
  );

  const refreshed = await counters.findOne({ _id: 'batchId' });
  return refreshed?.sequence_value || 1;
}

function normalizePayload(payload = {}) {
  const name = (payload.name || '').trim();
  const info = (payload.info || '').trim();
  const price = Number(payload.price);
  const age = Number(payload.age);

  if (!name || !info || Number.isNaN(price) || Number.isNaN(age)) {
    throw new Error('Please provide name, info, price, and age.');
  }

  return { name, info, price, age };
}

async function saveBook(db, payload) {
  const { name, info, price, age } = normalizePayload(payload);
  const bookId = await getNextSequence(db, 'bookId');
  const batchId = await getDailyBatchId(db);
  const timestamp = new Date();

  const bookDocument = {
    bookId,
    batchId,
    name,
    info,
    price,
    age,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  const books = db.collection('books');
  const { insertedId } = await books.insertOne(bookDocument);

  return { bookId, batchId, documentId: insertedId, createdAt: timestamp };
}

module.exports = { saveBook };
