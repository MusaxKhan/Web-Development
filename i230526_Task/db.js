const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/studentDB");
        console.log("MongoDB Connected: studentDB");
    } catch (err) {
        console.log("DB Connection Error:", err);
    }
};

module.exports = connectDB;