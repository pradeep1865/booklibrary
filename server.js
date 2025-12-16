const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://pradeep1865_lib_owner:cooldude12@clusterlib1.scu8jvu.mongodb.net/?appName=ClusterLib1';

const client = new MongoClient(mongoUri);
let database;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

async function getNextSequence(sequenceId) {
  const counters = database.collection('counters');
  const result = await counters.findOneAndUpdate(
    { _id: sequenceId },
    { $inc: { sequence_value: 1 } },
    { upsert: true, returnDocument: 'after' }
  );

  return result.value.sequence_value;
}

async function getDailyBatchId() {
  const counters = database.collection('counters');
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

  return result.value.sequence_value;
}

app.post('/api/books', async (req, res) => {
  try {
    const { name, info, price, age } = req.body;

    if (!name || !info || price === undefined || age === undefined) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const bookId = await getNextSequence('bookId');
    const batchId = await getDailyBatchId();
    const timestamp = new Date();

    const bookDocument = {
      bookId,
      batchId,
      name,
      info,
      price: Number(price),
      age: Number(age),
      createdAt: timestamp,
      updatedAt: timestamp
    };

    const books = database.collection('books');
    const { insertedId } = await books.insertOne(bookDocument);

    res.json({
      message: 'Book saved successfully.',
      bookId,
      batchId,
      documentId: insertedId
    });
  } catch (error) {
    console.error('Failed to save book', error);
    res.status(500).json({ message: 'Failed to save book entry.' });
  }
});

async function start() {
  try {
    await client.connect();
    database = client.db('booklibrary');
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

start();
