const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');

router.post('/', boardController.createBoard);
router.get('/', boardController.getBoards);
router.get('/:id', boardController.getBoard);
router.get('/my/:userId', boardController.getUserBoards);
router.delete('/:id', boardController.deleteBoard);

module.exports = router;
