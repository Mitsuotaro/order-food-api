const express = require('express');
const { mysqlPromise: pool } = require('../config/db.js');
const { z } = require('zod');
const router = express.Router();

router.get('/foods', async(req, res) => 
    await getFoods(req.query, res)
)

async function getFoods(params, res){
    try {
        const result = await pool.query(
                `SELECT 
                    f.*, 
                    fc.description AS categoryDescription,
                    0 as quantity,
                    0 as total

                FROM foods f
                INNER JOIN food_category fc ON fc.id = f.category`
            );

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = router;
