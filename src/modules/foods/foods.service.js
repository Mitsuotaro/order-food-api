const foodsRepository = require('./foods.repository.js');

const getFoods = async(filters) => {
    const foods = await foodsRepository.getFoods(filters);

    const formatted = foods.map((food) => {
        return {
            ...food,
        }
    });

    // 0 as quantity,
    // 0 as total
    
    return foods;
}


module.exports = {
    getFoods
};