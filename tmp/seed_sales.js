const mongoose = require("mongoose");
const Product = require("./models/Product");

const uri = "mongodb+srv://phamminhchuong2323_db_user:12345678%40@cluster0.lgzrgqv.mongodb.net/?appName=Cluster0";

async function seed() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    const products = await Product.find({});
    if (products.length === 0) {
      console.log("No products found to update");
      return;
    }

    for (let i = 0; i < products.length; i++) {
        // Randomly set totalSold between 10 and 100 for the first 15 products
        if (i < 15) {
            const randomSales = Math.floor(Math.random() * 90) + 10;
            await Product.findByIdAndUpdate(products[i]._id, { totalSold: randomSales });
            console.log(`Updated ${products[i].title} with ${randomSales} sales`);
        } else {
             await Product.findByIdAndUpdate(products[i]._id, { totalSold: 0 });
        }
    }

    console.log("Seeding completed");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
