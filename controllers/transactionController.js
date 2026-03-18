const db = require('../config/db');

// ISSUE BOOK
exports.issueBook = (req, res) => {
    const user_id = req.user.id;
    const { book_id } = req.body;

    // 1. Check availability
    db.query(
        "SELECT available_quantity FROM books WHERE id = ?",
        [book_id],
        (err, result) => {
            if (err) return res.status(500).json(err);

            if (result.length === 0) {
                return res.status(404).json({ message: "Book not found" });
            }

            if (result[0].available_quantity <= 0) {
                return res.json({ message: "Book not available" });
            }

            const issueDate = new Date();

            const dueDate = new Date();
            dueDate.setDate(issueDate.getDate() + 7); // 7 days

            // Check if already issued
            db.query(
                "SELECT * FROM transactions WHERE user_id=? AND book_id=? AND status='issued'",
                [user_id, book_id],
                (err, result) => {
                    if (result.length > 0) {
                        return res.json({ message: "Book already issued" });
                    }

                    // continue issue logic here
                }
            );

            // 2. Insert transaction
            db.query(
                "INSERT INTO transactions (user_id, book_id, issue_date, due_date) VALUES (?, ?, ?, ?)",
                [user_id, book_id, issueDate, dueDate]
            );

            // 3. Update book count
            db.query(
                "UPDATE books SET available_quantity = available_quantity - 1 WHERE id = ?",
                [book_id]
            );

            res.json({ message: "Book issued successfully" });
        }
    );
};

// RETURN BOOK
exports.returnBook = (req, res) => {
    const { transaction_id } = req.body;

    // 1. Get transaction
    db.query(
        "SELECT * FROM transactions WHERE id = ?",
        [transaction_id],
        (err, result) => {
            if (err) return res.status(500).json(err);

            if (result.length === 0) {
                return res.status(404).json({ message: "Transaction not found" });
            }

            const transaction = result[0];

            const returnDate = new Date();
            const dueDate = new Date(transaction.due_date);

            // 2. Calculate fine
            const diffDays = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24));
            const fine = diffDays > 0 ? diffDays * 5 : 0;

            // 3. Update transaction
            db.query(
                "UPDATE transactions SET return_date=?, fine=?, status='returned' WHERE id=?",
                [returnDate, fine, transaction_id]
            );

            // 4. Increase book quantity
            db.query(
                "UPDATE books SET available_quantity = available_quantity + 1 WHERE id=?",
                [transaction.book_id]
            );

            res.json({
                message: "Book returned successfully",
                fine: fine
            });
        }
    );
};

exports.getMyBooks = (req, res) => {
    const user_id = req.user.id;

    db.query(
        `SELECT t.*, b.title 
         FROM transactions t
         JOIN books b ON t.book_id = b.id
         WHERE t.user_id = ? AND t.status='issued'`,
        [user_id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json(result);
        }
    );
};

exports.getOverdueBooks = (req, res) => {
    db.query(
        `SELECT t.*, b.title, u.name 
         FROM transactions t
         JOIN books b ON t.book_id = b.id
         JOIN users u ON t.user_id = u.id
         WHERE t.due_date < CURDATE() AND t.status='issued'`,
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json(result);
        }
    );
};

exports.getDashboard = (req, res) => {
    db.query(
        `SELECT 
            (SELECT COUNT(*) FROM books) AS total_books,
            (SELECT COUNT(*) FROM users) AS total_users,
            (SELECT COUNT(*) FROM transactions WHERE status='issued') AS issued_books`,
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json(result[0]);
        }
    );
};