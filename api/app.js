const express = require('express');
const tourRoutes = require('./routes/tourRoutes');

const app = express();

app.use(express.json());

app.use('/api/v2/tours', tourRoutes);

module.exports = app;
