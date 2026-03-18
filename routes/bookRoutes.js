const express = require('express');
const router = express.Router();

const { getBooks, addBook } = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', getBooks);

// 🔐 + 👑 Protected + Admin only
router.post('/', authMiddleware, adminMiddleware, addBook);

module.exports = router;