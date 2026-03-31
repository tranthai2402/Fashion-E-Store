require("dotenv").config();
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "Found (starts with " + process.env.GOOGLE_CLIENT_ID.substring(0, 10) + "...)" : "Not Found");
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "Found (starts with " + process.env.GOOGLE_CLIENT_SECRET.substring(0, 10) + "...)" : "Not Found");
