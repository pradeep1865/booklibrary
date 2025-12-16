const { getDb } = require('../lib/db');
const { saveBook } = require('../lib/bookService');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = await getDb();
    const payload = req.body || {};
    const { bookId, batchId, documentId } = await saveBook(db, payload);

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
};
