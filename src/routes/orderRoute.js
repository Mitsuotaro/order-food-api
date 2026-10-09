const express = require('express');
const { mysqlPromise: pool } = require('../config/db.js');
const { z } = require('zod');
const router = express.Router();

router.post('/order', async(req, res) => 
    await insertOrder(req.body, res)
)

async function insertOrder(data, res){
    let connection;
    try {
        const { allTotal, orders } = data;

        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [rows] = await pool.query(
            "SELECT NOW() AS datetime"
        );

        let datetime = rows[0].datetime;
       

        const [orderHeader] = await connection.query(`
                INSERT INTO order_header 
                    (total, orderStatusID, orderDateTime, status)
                VALUES (?, ?, ?, ?)`,
            [ allTotal, 1, datetime, 1]
        );

       for (const item of orders) {
            await connection.query(
                `INSERT INTO order_details 
                    (headerID, foodID, quantity, total, status)
                VALUES (?, ?, ?, ?, ?)`,
                [orderHeader.insertId, item.id, item.quantity, item.total, 1]
            );
        }

        await connection.commit();
        return res.status(201).json({ 
            message: "test only post",
            result: orderHeader
        }); 
    } catch (error) {
        if(connection) await connection.rollback();
        res.status(500).json({ error: error.message });
    }
}

module.exports = router;
