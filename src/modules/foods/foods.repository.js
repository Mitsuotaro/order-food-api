const { mysqlPromise: pool } = require('../../config/db.js');

async function getFoods(){
    const [ rows ] = await pool.query(`
            SELECT 
                f.id AS foodID,
                f.name as foodName,
                f.price as foodPrice,
                f.description as foodDescription,
                f.category_id as categoryID,
                f.status as foodStatus,
                fc.description AS categoryDescription

            FROM foods f
            INNER JOIN food_category fc ON fc.id = f.category_id
            
            WHERE f.status = ?
        `, [
            1
        ]);

    return rows;
};

async function updateFood(){
    const response = await pool.query(`
        UPDATE foods
            SET 
                name = ?,
                description = ?,
                category_id = ?,
                status = ?,
                price = ?

            WHERE id = ?
    `);

    console.log("updateFood: ", response);

    return response;
}

module.exports = {
    getFoods,
    updateFood,
}

// export const findAll = async ({
//     categoryID,
//     minPrice,
//     maxPrice,
//     search
// }) => {
//     let sql = `
//         SELECT f.*
//         FROM foods AS f
//         WHERE 1 = 1
//     `;

//     const params = [];

//     // Filter by category
//     if (categoryID !== undefined) {
//         sql += ` AND f.category_id = ?`;
//         params.push(categoryID);
//     }

//     // Search by food name
//     if (search) {
//         sql += ` AND f.name LIKE ?`;
//         params.push(`%${search}%`);
//     }

//     // Filter by price
//     if (
//         minPrice !== undefined ||
//         maxPrice !== undefined
//     ) {
//         sql += `
//             AND EXISTS (
//                 SELECT 1
//                 FROM food_price AS fp
//                 WHERE fp.food_id = f.id
//         `;

//         if (minPrice !== undefined) {
//             sql += ` AND fp.price >= ?`;
//             params.push(minPrice);
//         }

//         if (maxPrice !== undefined) {
//             sql += ` AND fp.price <= ?`;
//             params.push(maxPrice);
//         }

//         sql += ` )`;
//     }

//     const [rows] = await pool.query(sql, params);

//     return rows;
// };

