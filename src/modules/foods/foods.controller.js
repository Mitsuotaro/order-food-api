const foodsService = require('./foods.service.js');

const getFoods = async(req, res) => {
    try {
        const filters = {
            categoryID: req.query.categoryID,
            search: req.query.search,
        };

        const foods = await foodsService.getFoods(filters);

        return res.status(200).json({
            data: foods,
        });
    } catch (error) {
        console.error("An error occurred on getFoods: ", error);
        next(error);
    }
};

module.exports = {
    getFoods
};