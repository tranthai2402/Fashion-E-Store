require("dotenv").config();
const mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI;

async function checkData() {
  try {
    await mongoose.connect(MONGODB_URI);
    const collection = mongoose.connection.collection("users");
    
    const nullEmails = await collection.find({ email: null }).toArray();
    console.log("Users with email: null count:", nullEmails.length);
    if (nullEmails.length > 0) {
        console.log("Sample user with null email:", nullEmails[0]);
    }

    const missingEmails = await collection.find({ email: { $exists: false } }).toArray();
    console.log("Users with MISSING email field count:", missingEmails.length);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
