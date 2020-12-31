const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/.env` });

// in production we shoud a tool which restart the server in case of server creash
if (process.env.NODE_ENV === 'production') {
  // Handle uncaught exception anyhere in the app that is not handle by global error handler
  process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥');
    console.log(err.name, err.message);
    process.exit(1);
  });
}

const app = require('./api/app');
const connectDB = require('./api/utils/db');

connectDB();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log('Listning to the server!! 😝');
  console.log(`App running on port ${PORT}!! 🌵`);
});

if (process.env.NODE_ENV === 'production') {
  // Handle unhandled rejection anyhere in the app that is not handle by global error handler
  process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });
}
