const express = require('express');
const { mysqlPromise: pool } = require('../config/db.js');
const { z } = require('zod');
const router = express.Router();

const foodSchema = z.object({
    name: z.string().trim().min(3).max(100),
    description: z.string().trim().min(3).max(255),
    price: z.number().nonnegative(),
    categoryID: z.number().int().positive(),
});

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if(!result.success){
        return res.status(400).json({ errors: result.error.issues });
    }

    req.body = result.data;
    next();
}

async function insertFood(data, res){
    let connection;
    try {
        const { name, description, price, categoryID } = data;

        connection = await pool.getConnection();

        await connection.beginTransaction();
        
        const [result] = await connection.query(`
                INSERT INTO foods 
                    (name, description, category_id, created_by_id, created_date_time, status)
                VALUES
                ( ?, ?, ?, ?, ?, ? )
            `,
            [ name, description, categoryID, 1, new Date(), 1]
        );

        await connection.query(`
                INSERT INTO food_price 
                    (food_id, price, created_by_id, created_date_time, status)
                VALUES
                ( ?, ?, ?, ?, ? )
            `,
            [ result.insertId, price, 1, new Date(), 1 ]
        );

        await connection.commit();
        return res.status(201).json({ 
            message: "Successfully added new food.",
            result: result
        });
    } catch (error) {
        if(!connection) await connection.rollback();
        return res.status(500).json({ error: error.message })
    } finally {
        if(!connection) await connection.release();
    }
}

router.post('/foods', validate(foodSchema), async(req, res) => 
    await insertFood(req.body, res)
);

module.exports = router;
