const { z } = require('zod');

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
});

module.exports = {
    insertFoodSchema,
    updateFoodSchema
};