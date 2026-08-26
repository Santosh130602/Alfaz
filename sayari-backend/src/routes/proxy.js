// routes/proxy.js
'use strict';

const express = require('express');
const { streamFile } = require('../config/drive'); // adjust path

const router = express.Router();

router.get('/image', async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing id parameter' });
  }

  try {
    await streamFile(id, res);
  } catch (err) {
    console.error('[Proxy] Failed to stream file:', err.message);
    res.status(500).json({ error: 'Failed to load image' });
  }
});

module.exports = router;



