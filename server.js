const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");

const Review = require('./models/review.models.js');
const Upvote = require('./models/upvote.models.js');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://andreacero:A.acero2020@backenddb.0peewj7.mongodb.net/FoodReviewAPI?retryWrites=true&w=majority&appName=BackendDB")
    .then(() => console.log("Connected to MongoDB"))
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

// Crear una reseña
app.post("/api/reviews", async (req, res) => {
    try {
        const review = await Review.create(req.body);
        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Agarrar reseñas por lugar
app.get("/api/reviews/:place_id", async (req, res) => {
    try {
        const reviews = await Review.find({ place_id: req.params.place_id });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Borrar reseña por ID
app.delete("/api/reviews/:id", async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ message: "Reseña no encontrada" });
        res.status(200).json({ message: "Reseña eliminada exitosamente" });
    } catch (error) {
        res.status(500).json({ message: error.message });
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
