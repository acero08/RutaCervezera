const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const axios = require('axios');


const Review = require("./models/review.models.js");
const Upvote = require("./models/upvote.models.js");

require('dotenv').config(); 
const YELP_API_KEY = process.env.YELP_API_KEY;

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Hace load al Swagger YAML file
const swaggerDocument = YAML.load("./swagger.yaml");
// Hace el setup del Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Para verificar si esta agrrando
console.log("Yelp API Key:", YELP_API_KEY ? "Loaded" : " Missing!");


// Yelp API Base URL
const YELP_BASE_URL = "https://api.yelp.com/v3/businesses";

// Headers
const yelpHeaders = {
  Authorization: `Bearer ${YELP_API_KEY}`,
  "Content-Type": "application/json",
};

mongoose.connect("mongodb+srv://andreacero:A.acero2020@backenddb.0peewj7.mongodb.net/FoodReviewAPI?retryWrites=true&w=majority&appName=BackendDB")
    .then(() => console.log("Connected to yay"))
    .catch(error => console.error("Connection error:", error.message));


// Cargar datos desde un JSON
app.post('/api/reviews/load', async (req, res) => {
    fs.readFile('reviews.json', 'utf8', async (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error al leer el archivo" });
        }
        try {
            const reviewsData = JSON.parse(data);
            await Review.insertMany(reviewsData);
            res.status(200).json({ message: "Reseñas cargadas exitosamente" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
});

// Rutas
app.get("/", (req, res) => {
    res.send("API de Reviews y Upvotes");
});

//BUSCAR
app.get("/api/bars/search", async (req, res) => {
    try {
      const { name, location = "San Diego", limit = 5 } = req.query;
  
      // Debug: Log headers to verify the API key
      console.log("Request Headers:", {
        Authorization: `Bearer ${YELP_API_KEY ? "***loaded***" : "MISSING!"}`,
      });
  
      const response = await axios.get(`${YELP_BASE_URL}/search`, {
        headers: {
          Authorization: `Bearer ${YELP_API_KEY}`,
          "Content-Type": "application/json",
        },
        params: {
          term: name,
          location,
          limit,
        },
      });
  
      const matchingBars = name
        ? response.data.businesses.filter((bar) =>
            bar.name.toLowerCase().includes(name.toLowerCase())
          )
        : response.data.businesses;
  
      res.json(matchingBars);
    } catch (error) {
      console.error("Yelp API Error:", error.response?.data || error.message);
      res.status(500).json({
        error: "Search failed",
        details: error.response?.data || error.message,
      });
    }
  });
  
// Crear upvote
app.post("/api/upvotes", async (req, res) => {
    try {
        const upvote = await Upvote.create(req.body);
        res.status(201).json(upvote);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Agarrar upvote
app.get("/api/upvotes/:place_id/count", async (req, res) => {
    try {
        const count = await Upvote.countDocuments({ place_id: req.params.place_id });
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
