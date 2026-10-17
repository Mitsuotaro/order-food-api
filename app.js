require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.BASE_URL_PORT;
const cors = require('cors');

const settingsRoute = require('./src/routes/settingsRoute.js');
const menuRoute = require('./src/routes/menuRoute.js');
const orderRoute = require('./src/routes/orderRoute.js');

app.use(cors({
    origin: `http://localhost:${port}`,
}));

app.use(express.json());

app.use('/', settingsRoute);
app.use('/', menuRoute);
app.use('/', orderRoute);

app.get('/', (req, res) => {
    res.send(`Hello World!`);
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});