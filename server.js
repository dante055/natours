const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/.env` });

const app = require('./api/app');
const connectDB = require('./api/utils/db');

connectDB();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log('Listning to the server!! 😝');
  console.log(`App running on port ${PORT}!! 🌵`);
});
