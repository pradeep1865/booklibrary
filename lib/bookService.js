async function ensureCounterInitialized(counters, sequenceId, defaults = {}) {
  await counters.updateOne({ _id: sequenceId }, { $setOnInsert: defaults }, { upsert: true });
}

async function getNextSequence(db, sequenceId) {
  const counters = db.collection('counters');

  await ensureCounterInitialized(counters, sequenceId, { sequence_value: 0 });

  const result = await counters.findOneAndUpdate(
    { _id: sequenceId },
    { $inc: { sequence_value: 1 } },
    { returnDocument: 'after' }
  );

  return result?.value?.sequence_value || 1;
}

async function getDailyBatchId(db) {
  const counters = db.collection('counters');
  const today = new Date();
  const dateKey = today.toISOString().slice(0, 10);

  await ensureCounterInitialized(counters, 'batchId', {
    sequence_value: 1,
    lastDate: dateKey
  });

  const sameDay = await counters.findOneAndUpdate(
    { _id: 'batchId', lastDate: dateKey },
    { $set: { lastDate: dateKey } },
    { returnDocument: 'after' }
  );

  if (sameDay?.value?.sequence_value) {
    return sameDay.value.sequence_value;
  }

  const updated = await counters.findOneAndUpdate(
    { _id: 'batchId' },
    { $inc: { sequence_value: 1 }, $set: { lastDate: dateKey } },
    { returnDocument: 'after' }
  );

  return updated?.value?.sequence_value || 1;
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
