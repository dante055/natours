const express = require('express');
const tourRoutes = require('./routes/tourRoutes');
const globalErrorHandler = require('./controllers/errorController.js');

const app = express();

app.use(express.json());

app.use('/api/v2/tours', tourRoutes);

app.use('*', (req, res) => {
  return res.status(404).json({
    status: 'fail',
    error: {
      message: 'Not Found',
    },
  });
});

app.use(globalErrorHandler);

module.exports = app;
