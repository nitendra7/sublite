const mongoose = require("mongoose");
const MONGO_URI = process.env.MONGO_URI || 3000;
const connect = () => mongoose.connect(MONGO_URI).then(
    () => console.log("db connected")
);
module.exports = connect;