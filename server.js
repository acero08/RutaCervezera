const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const axios = require('axios');
const bcrypt = require("bcryptjs")
const jwt= require('jsonwebtoken')


const Review = require("./models/review.models.js");
const Upvote = require("./models/upvote.models.js");
//const UserDetail = require("./models/UserDetail.models.js");

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

//TODO LO DE LOGIN Y REGISTER //




////********************************************////
// Rutas
app.get("/", (req, res) => {
    res.send("API de Reviews y Upvotes");
});

app.get('/api/categories', async (req, res) => {
  try {
    const response = await axios.get('https://api.yelp.com/v3/categories', {
      headers: yelpHeaders
    });

    // Filtrar categorías relacionadas con bares y bebidas
    const barCategories = response.data.categories.filter(category =>
      category.title.toLowerCase().includes('bar') || 
      category.title.toLowerCase().includes('cerveza') || 
      category.title.toLowerCase().includes('cóctel') || 
      category.title.toLowerCase().includes('whisky')
    );

    res.json(barCategories);
  } catch (error) {
    console.error('Categories Error:', error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to get categories",
      details: error.response?.data || error.message
    });
  }
});


// BUSCAR
app.get("/api/bar/search", async (req, res) => {
    try {
      const { name, location = "Mexicali", limit = 5, categories } = req.query;
  
      const params = {
        term: name,
        location,
        limit,
        ...(categories && { categories }) 
      };
  
      const response = await axios.get(`${YELP_BASE_URL}/search`, {
        headers: yelpHeaders,
        params
      });
  
      const matchingBars = name
        ? response.data.businesses.filter((cerveceria) =>
          cerveceria.name.toLowerCase().includes(name.toLowerCase())
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

  // X id
  app.get('/api/bar/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: "Business ID is required" });
      }
  
      const response = await axios.get(`${YELP_BASE_URL}/${id}`, {
        headers: yelpHeaders
      });
  
      res.json(response.data);
    } catch (error) {
      console.error('Business Details Error:', error.response?.data || error.message);
      
      const status = error.response?.status || 500;
      const errorData = {
        error: "Failed to get business details",
        details: error.response?.data || error.message
      };
  
      if (status === 404) {
        errorData.error = "Business not found on Yelp";
      }
  
      res.status(status).json(errorData);
    }
  });

  
 // Reviews Yelp
 app.get('/api/bar/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: "Business ID is required" });
    }

    try {
      const yelpResponse = await axios.get(`${YELP_BASE_URL}/${id}/reviews`, {
        headers: yelpHeaders
      });
      
      if (yelpResponse.data.reviews && yelpResponse.data.reviews.length > 0) {
        return res.json({
          ...yelpResponse.data,
          source: 'yelp'
        });
      }
    } catch (yelpError) {
      console.log('Yelp reviews not available, trying local database...');
    }

   
    const localReviews = await Review.find({ place_id: id });
    if (localReviews.length > 0) {
      return res.json({
        reviews: localReviews,
        total: localReviews.length,
        source: 'local_database'
      });
    }

    res.status(404).json({
      error: "No reviews available",
      details: "This business has no reviews in either Yelp or our local database"
    });

  } catch (error) {
    console.error('Reviews Error:', error.message);
    res.status(500).json({
      error: "Failed to get reviews",
      details: error.message
    });
  }
});


//Buisiness MAtch

app.post('/api/bar/match', async (req, res) => {
  try {
    const { name, address1, city, state, country } = req.body;
    
    if (!name || !address1 || !city || !state || !country) {
      return res.status(400).json({ error: "All fields (name, address1, city, state, country) are required" });
    }

    const response = await axios.get(`${YELP_BASE_URL}/matches`, {
      headers: yelpHeaders,
      params: {
        name,
        address1,
        city,
        state,
        country
      }
    });

    if (response.data.businesses && response.data.businesses.length > 0) {
      res.json(response.data.businesses[0]);
    } else {
      res.status(404).json({ error: "No matching business found" });
    }
  } catch (error) {
    console.error('Business Match Error:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      error: "Failed to match business",
      details: error.response?.data || error.message
    });
  }
});

//Delivary para munchiess nos se si usar
app.get('/api/business/delivery', async (req, res) => {
  try {
    const { location, limit = 5, categories } = req.query;
    
    if (!location) {
      return res.status(400).json({ error: "Location parameter is required" });
    }

    // First try the delivery-specific endpoint
    try {
      const response = await axios.get(`${YELP_BASE_URL}/transactions/delivery/search`, {
        headers: yelpHeaders,
        params: { location, limit }
      });
      
      if (response.data.businesses?.length > 0) {
        return res.json(response.data.businesses);
      }
    } catch (deliveryError) {
      console.log('Delivery endpoint not available, falling back to regular search with delivery filter...');
    }

    // Fallback to regular search with transactions filter
    const params = {
      location,
      limit,
      ...(categories && { categories }),
      attributes: "delivery" // Filter for delivery-available businesses
    };

    const fallbackResponse = await axios.get(`${YELP_BASE_URL}/search`, {
      headers: yelpHeaders,
      params
    });

    // Locales que hacen delivery
    const deliveryBusinesses = fallbackResponse.data.businesses?.filter(b => 
      b.transactions?.includes("delivery")
    ) || [];

    res.json(deliveryBusinesses.slice(0, limit));

  } catch (error) {
    console.error('Delivery Search Error:', error.response?.data || error.message);
    
    const status = error.response?.status || 500;
    const errorData = {
      error: "Failed to find delivery options",
      details: error.response?.data || error.message
    };

    res.status(status).json(errorData);
  }
});

  // AutoComplete
app.get("/api/autocomplete", async (req, res) => {
    try {
      const { text, latitude, longitude } = req.query;
      
      if (!text) {
        return res.status(400).json({ error: "Text parameter is required" });
      }
  
      const params = {
        text,
        ...(latitude && longitude && { latitude, longitude })
      };
  
      const response = await axios.get(`${YELP_BASE_URL}/autocomplete`, {
        headers: yelpHeaders,
        params
      });
  
      res.json(response.data);
    } catch (error) {
      console.error("Autocomplete Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        error: "Autocomplete failed",
        details: error.response?.data || error.message
      });
    }
  });
  
//Reviews CRUD
app.post('/api/reviews', async (req, res) => {
  try {
    const { place_id, user_id, rating, comment } = req.body;
    
    if (!place_id || !user_id || !rating) {
      return res.status(400).json({ error: "place_id, user_id, and rating are required" });
    }

    const newReview = await Review.create({
      place_id,
      user_id,
      rating,
      comment: comment || "",
      date: new Date()
    });

    res.status(201).json(newReview);
  } catch (error) {
    console.error('Create Review Error:', error);
    res.status(500).json({ error: "Failed to create review", details: error.message });
  }
});

app.get('/api/reviews/place/:place_id', async (req, res) => {
  try {
    const reviews = await Review.find({ place_id: req.params.place_id })
                              .sort({ date: -1 }); // Newest first
    
    if (reviews.length === 0) {
      return res.status(404).json({ message: "No reviews found for this place" });
    }

    res.json(reviews);
  } catch (error) {
    console.error('Get Reviews Error:', error);
    res.status(500).json({ error: "Failed to get reviews", details: error.message });
  }
});

app.get('/api/reviews/user/:user_id', async (req, res) => {
  try {
    const reviews = await Review.find({ user_id: req.params.user_id })
                              .sort({ date: -1 });
    
    if (reviews.length === 0) {
      return res.status(404).json({ message: "No reviews found for this user" });
    }

    res.json(reviews);
  } catch (error) {
    console.error('Get User Reviews Error:', error);
    res.status(500).json({ error: "Failed to get user reviews", details: error.message });
  }
});

app.put('/api/reviews/:review_id', async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating && !comment) {
      return res.status(400).json({ error: "At least one field (rating or comment) is required" });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.review_id,
      { 
        rating: rating || undefined,
        comment: comment || undefined,
        updated_at: new Date() 
      },
      { new: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json(updatedReview);
  } catch (error) {
    console.error('Update Review Error:', error);
    res.status(500).json({ error: "Failed to update review", details: error.message });
  }
});

app.delete('/api/reviews/:review_id', async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.review_id);
    
    if (!deletedReview) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error('Delete Review Error:', error);
    res.status(500).json({ error: "Failed to delete review", details: error.message });
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
