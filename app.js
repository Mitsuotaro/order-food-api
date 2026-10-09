require('dotenv').config();
const express = require('express');
const app = express();
const port = 8000;
const cors = require('cors');

const settingsRoute = require('./src/routes/settingsRoute.js');
const menuRoute = require('./src/routes/menuRoute.js');
const orderRoute = require('./src/routes/orderRoute.js');

app.use(cors({
    origin: [
        `http://localhost:${process.env.BASE_URL_PORT}`,
    ],
}));

app.use(express.json());

app.use('/', settingsRoute);
app.use('/', menuRoute);
app.use('/', orderRoute);

// app.get('/', (req, res) => {
//     res.send(`Hello World!`);
// });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});