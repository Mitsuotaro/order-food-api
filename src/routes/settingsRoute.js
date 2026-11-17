const express = require('express');
const { mysqlPromise: pool } = require('../config/db.js');
const router = express.Router();

const { validate } = require("../middlewares/schemaValidation.js");

const {
    insertFoodSchema,
    updateFoodSchema
} = require("../schemas/foodsSchema");

router.post('/food', validate(insertFoodSchema), async(req, res) => 
    await insertFood(req.body, res)
);

router.put('/food',  validate(updateFoodSchema), async(req, res) => 
    await updateFood(req.body, res)
);

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

async function getFoodPrice()
{

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
                
                FROM food_price fp
                    INNER JOIN (

                        SELECT 
                            MAX(latest_fp.id) as latest_price_id,
                            latest_fp.food_id

                        FROM food_price latest_fp
                        WHERE latest_fp.food_id = ?
                            AND latest_fp.Status = ?

                        GROUP BY latest_fp.food_id

                    ) AS latest ON latest.food_id = fp.id

                WHERE fp.food_id = ? 
                    AND fp.Status = ?
            `,
            [ foodID, price, 1, 1 ]
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

        // await connection.commit();
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

module.exports = router;
