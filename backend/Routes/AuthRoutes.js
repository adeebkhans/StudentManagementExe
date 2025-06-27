const express = require('express');
const router = express.Router();
const { login } = require('../Controllers/AuthController');

router.post('/login', login);

module.exports = router;
