const mongoose = require("mongoose");
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sublite';
const connect = () => mongoose.connect(MONGO_URI).then(
    () => console.log("db connected")
);
module.exports = connect;