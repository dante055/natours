const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const tourRoutes = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController.js');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(cookieParser());

app.use('/api/v2/tours', tourRoutes);
app.use('/api/v2/users', userRoutes);

app.use('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
