const express = require('express');
const router = express.Router();
const playerController = require('../controllers/player.controller');

// Player routes
router.post('/', playerController.createPlayer);           // Create player
router.get('/:playerId', playerController.getPlayerById);  // Get player by ID

module.exports = router;
