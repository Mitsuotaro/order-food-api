const express = require('express');
const { mysqlPromise: pool } = require('../config/db.js');
const { z } = require('zod');
const router = express.Router();

const foodSchema = z.object({
    description: z.string().trim().min(3).max(100),
    price: z.number().nonnegative(),
    category: z.number().int().positive(),
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
        const { description, price, category } = data;

        connection = await pool.getConnection();

        await connection.beginTransaction();
        
        const [result] = await connection.query(`
                INSERT INTO foods 
                    (description, price, category, status)
                VALUES
                ( ?, ?, ?, ? )
            `,
            [ description, price, category, 1]
        );

        await connection.commit();
        return res.status(201).json({ 
            message: "test only post",
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
