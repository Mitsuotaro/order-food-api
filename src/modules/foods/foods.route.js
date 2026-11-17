const express = require('express');
const { mysqlPromise: pool } = require('../../config/db.js');
const { z } = require('zod');
const router = express.Router();

const foodsController = require('./foods.controller.js');

router.get('/', foodsController.getFoods);

module.exports = router;
