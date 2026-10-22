const express = require('express');
const { mysqlPromise: pool } = require('../config/db.js');
const { z } = require('zod');
const router = express.Router();

const insertFoodSchema = z.object({
    name: z.string().trim().min(3).max(100),
    description: z.string().trim().min(3).max(255),
    price: z.number().nonnegative(),
    categoryID: z.number().int().positive(),
});

const updateFoodSchema = insertFoodSchema.extend({
    foodID: z.int(),
    status: z.preprocess(
        (value) => value === 1 ? true : value === 0 ? false : value,
        z.boolean()
    )
})

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

async function updateFood(data, res){
    let connection;
    try {
        const { foodID, name, description, price, categoryID, status } = data;
        
        connection = await pool.getConnection();

        await connection.beginTransaction();
        
        // const [ result ] = await connection.query(`
        //         UPDATE foods
        //             SET
        //                 name = ?,
        //                 description = ?,
        //                 category_id = ?,
        //                 status = ?
        //             WHERE id = ?
        //     `,
        //     [ name, description, categoryID, status, foodID ]
        // );

        const [ priceResult ] = await connection.query(`
                SELECT 
                    * 
                
                FROM food_price 
                    INNER JOIN (
                        SELECT 
                            MAX(id) as latest_price_id,
                            food_id
                        FROM food_price 
                        WHERE food_id = ?
                            AND Status = ?
                        GROUP BY food_id
                    ) AS latest ON latest.food_id = food_price.id
                WHERE food_id = ? 
                    AND Status = ?
            `,
            [ foodID, price, 1 ]
        );

        // if(priceResult.length <= 0){
        //     await connection.query(`
        //         UPDATE food_price
        //             SET 
        //                 status = ?
        //             WHERE food_id = ?
        //                 AND status = ?
                
        //     `);

        //     await connection.query(`
        //         INSERT INTO food_price 
        //             (food_id, price, created_by_id, created_date_time, status)
        //         VALUES
        //         ( ?, ?, ?, ?, ? )
        //     `,
        //         [ foodID, price, 1, new Date(), 1]
        //     );
        // }

        await connection.commit();
        return res.status(201).json({ 
            message: `Successfully updated ${name}`,
            priceResult: priceResult,
            // result: result,
        });
    } catch (error) {
        if(!connection) await connection.rollback();
        return res.status(500).json({ error: error.message });
    } finally {
        if(!connection) await connection.release();
    }
}

router.post('/food', validate(insertFoodSchema), async(req, res) => 
    await insertFood(req.body, res)
);

router.put('/food',  validate(updateFoodSchema), async(req, res) => 
    await updateFood(req.body, res)
);

module.exports = router;
