const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all exams
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM exams');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add more endpoints for creating, updating, deleting exams, etc.

module.exports = router; 