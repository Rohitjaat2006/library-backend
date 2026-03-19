const db = require('../config/db');

// GET ALL BOOKS
exports.getBooks = (req, res) => {
    db.query("SELECT * FROM books", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

// ADD BOOK
exports.addBook = (req, res) => {
    const { title, author, category, total_quantity } = req.body;

    db.query(
        "INSERT INTO books (title, author, category, total_quantity, available_quantity) VALUES (?, ?, ?, ?, ?)",
        [title, author, category, total_quantity, total_quantity],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Book added successfully" });
        }
    );
};