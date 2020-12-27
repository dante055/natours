const mongoose = require('mongoose');

const db = process.env.MONGO_URI;

const connectDb = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    console.log('DB connection successfull!! 🪐');
  } catch (error) {
    console.error('Something went worng!! Cant connect to database! ❌');
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDb;
