const express = require('express');
const router = express.Router();

// Import route modules
const gameRoutes = require('./game.routes');
const playerRoutes = require('./player.routes');

// Register routes
router.use('/games', gameRoutes);
router.use('/players', playerRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

module.exports = router;
