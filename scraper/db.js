const mongoose = require("mongoose");
const { carSchemaDefinition } = require("../shared/carSchema");

const carSchema = new mongoose.Schema(carSchemaDefinition, {
  timestamps: true,
  collection: "cars"
});

const Car = mongoose.models.Car || mongoose.model("Car", carSchema);

async function connectDb() {
  await mongoose.connect(process.env.MONGO_URI);
}

module.exports = { Car, connectDb };
