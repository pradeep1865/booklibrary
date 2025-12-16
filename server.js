const express = require('express');
const path = require('path');
const { getDb } = require('./lib/db');
const { saveBook } = require('./lib/bookService');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/books', async (req, res) => {
  try {
    const db = await getDb();
    const { bookId, batchId, documentId } = await saveBook(db, req.body || {});

    res.status(200).json({
      message: 'Book saved successfully.',
      bookId,
      batchId,
      documentId
    });
  } catch (error) {
    console.error('Failed to save book', error);
    res.status(500).json({ message: error.message || 'Failed to save book entry.' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
