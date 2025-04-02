const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');

// Game routes
router.post('/', gameController.createGame);           // Create a new game
router.get('/', gameController.listGames);             // List available games
router.get('/:gameId', gameController.getGameById);    // Get game by ID
router.post('/:gameId/join', gameController.joinGame); // Join a game

module.exports = router;
