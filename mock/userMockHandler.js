const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
dotenv.config();

mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('connection success');
  });
//read json file
const users = JSON.parse(fs.readFileSync(`${__dirname}/mockData/UserMock2.json`, 'utf-8'));
//import data into db
const importData = async () => {
  try {
    await User.create(users);
    console.log('data successfully loaded');
    process.exit();
  } catch (err) {
    console.log(err, 'err');
  }
};
//delete all data from collection
const deleteData = async () => {
  try {
    await User.deleteMany();
    console.log('data successfully deleted');
    process.exit();
  } catch (err) {
    console.log(err, 'err');
  }
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
};