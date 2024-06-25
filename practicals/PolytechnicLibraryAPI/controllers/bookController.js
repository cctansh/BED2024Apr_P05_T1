const Book = require("../models/book");

const getAllBooks = async (req, res) => {
  try {
    const books = await Book.getAllBooks();
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving books");
  }
};

const updateBookAvailability = async (req, res) => {
  const bookId = parseInt(req.params.bookId);
  const newBookData = req.body;

  try {
    const updatedBook = await Book.updateBookAvailability(bookId, newBookData);
    if (!updatedBook) {
      return res.status(404).send("Book not found");
    }
    res.json(updatedBook);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating book");
  }
};

module.exports = {
  getAllBooks,
  updateBookAvailability
};