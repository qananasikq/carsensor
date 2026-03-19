const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { auth } = require("./middleware/auth");
const { buildCarsQuery } = require("./utils/buildCarsQuery");
const { carSchemaDefinition } = require("../shared/carSchema");

dotenv.config();

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "ADMIN_LOGIN", "ADMIN_PASSWORD"];

function readCorsOrigins() {
  const raw = process.env.CORS_ORIGIN || "http://localhost:3000";
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function checkEnv() {
  const missing = requiredEnvVars.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: readCorsOrigins(), credentials: true }));
app.use(express.json());

const carSchema = new mongoose.Schema(carSchemaDefinition, {
  timestamps: true,
  collection: "cars"
});

const Car = mongoose.models.Car || mongoose.model("Car", carSchema);
const carsListFields = [
  "title",
  "brand",
  "model",
  "year",
  "mileage",
  "price",
  "priceRub",
  "region",
  "imageUrls",
  "rawSpecs"
].join(" ");

app.get("/api/health", async (_req, res) => {
  const mongoReady = mongoose.connection.readyState === 1;

  return res.json({
    ok: mongoReady,
    service: "backend",
    mongoReady
  });
});

app.post("/api/login", (req, res) => {
  const { login, password } = req.body || {};

  if (login !== process.env.ADMIN_LOGIN || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Неверный логин или пароль" });
  }

  const token = jwt.sign(
    {
      login,
      role: "admin"
    },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

  return res.json({ token });
});

app.get("/api/cars", auth, async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
    const { filter, sort } = buildCarsQuery(req.query);

    const [items, total] = await Promise.all([
      Car.find(filter)
        .select(carsListFields)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Car.countDocuments(filter)
    ]);

    return res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("GET /api/cars failed:", error);
    return res.status(500).json({ message: "Не удалось получить автомобили" });
  }
});

app.get("/api/cars/:id", auth, async (req, res) => {
  try {
    const item = await Car.findById(req.params.id).lean();

    if (!item) {
      return res.status(404).json({ message: "Автомобиль не найден" });
    }

    return res.json(item);
  } catch (error) {
    console.error("GET /api/cars/:id failed:", error);
    return res.status(500).json({ message: "Не удалось получить автомобиль" });
  }
});

async function start() {
  try {
    checkEnv();
    await mongoose.connect(process.env.MONGO_URI);
    const port = Number(process.env.PORT || 4000);
    app.listen(port, () => {
      console.log(`Backend is listening on ${port}`);
    });
  } catch (error) {
    console.error("Backend failed to start:", error);
    process.exit(1);
  }
}

start();
