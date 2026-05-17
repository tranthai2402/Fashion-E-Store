require("dotenv").config();
const mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI;

async function fixIndexes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const collection = mongoose.connection.collection("users");
    
    console.log("Existing indexes:");
    const indexes = await collection.indexes();
    console.log(indexes);

    // Drop unique indexes that might be causing issues
    try {
      await collection.dropIndex("email_1");
      console.log("Dropped email_1 index");
    } catch (e) { console.log("email_1 index not found or already dropped"); }

    try {
      await collection.dropIndex("userName_1");
      console.log("Dropped userName_1 index");
    } catch (e) { console.log("userName_1 index not found or already dropped"); }

    try {
      await collection.dropIndex("phone_1");
      console.log("Dropped phone_1 index");
    } catch (e) { console.log("phone_1 index not found or already dropped"); }

    try {
        await collection.dropIndex("googleId_1");
        console.log("Dropped googleId_1 index");
      } catch (e) { console.log("googleId_1 index not found or already dropped"); }

    console.log("Finished dropping indexes. Mongoose will recreate them with 'sparse' option on next start.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixIndexes();
