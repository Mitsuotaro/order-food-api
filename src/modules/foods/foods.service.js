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
    
    return formatted;
}

const updateFood = async(filters) => {
    const updated = await foodsRepository.updateFood(filters);
    return updated;
}


module.exports = {
    getFoods,
    updateFood,
};