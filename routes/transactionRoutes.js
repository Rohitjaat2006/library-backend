const express = require('express');
const router = express.Router();

const { issueBook, returnBook, getMyBooks, getOverdueBooks, getDashboard } = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/issue', authMiddleware, issueBook);
router.post('/return', authMiddleware, returnBook);
router.get('/my-books', authMiddleware, getMyBooks);
router.get('/overdue', authMiddleware, getOverdueBooks);
router.get('/dashboard', authMiddleware, getDashboard);

module.exports = router;