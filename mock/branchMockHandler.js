const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Branch = require('../models/Branch');
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
const branches = JSON.parse(fs.readFileSync(`${__dirname}/mockData/BranchMock2.json`, 'utf-8'));
//import data into db
const importData = async () => {
  try {
    await Branch.create(branches);
    console.log('data successfully loaded');
    process.exit();
  } catch (err) {
    console.log(err, 'err');
  }
};
//delete all data from collection
const deleteData = async () => {
  try {
    await Branch.deleteMany();
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