require("dotenv").config();
const mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI;

async function dumpUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    const collection = mongoose.connection.collection("users");
    
    const allUsers = await collection.find({}).toArray();
    console.log("All users in DB:");
    allUsers.forEach(u => {
        console.log(`- ID: ${u._id}, User: ${u.userName}, Email: ${u.email}, Phone: ${u.phone}, GoogleId: ${u.googleId}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

dumpUsers();
