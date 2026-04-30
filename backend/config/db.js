const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB successfully connected");
  } catch(err){
    console.error("connection failed", err);
  }
}

module.exports = connectDB;