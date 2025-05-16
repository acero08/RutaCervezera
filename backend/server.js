const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const axios = require('axios');
const bcrypt = require("bcryptjs")
const jwt= require('jsonwebtoken')
const multer = require("multer");


const Review = require("./models/Review.models.js");
const Upvote = require("./models/Upvote.models.js");
const User = require("./models/UserDetails.models.js");
const Bar = require("./models/Bar.models.js");
const Comment = require("./models/CommentReview.models.js");
const UpvoteReview = require("./models/UpvoteReview.models.js");
//const MenuItem = require("./models/MenuItem.models.js");
const BaseItem = require('./models/BaseItem.models.js');
const FoodItem = require('./models/FoodItem.models.js');
const DrinkItem = require('./models/DrinkItem.models.js');

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
    

// IMAGENES
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // La carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Nombre único para el archivo
  },
});

// Crear el middleware de upload
const upload = multer({ storage: storage });


        //TODO LO DE LOGIN Y REGISTER //
////********************************************////

const JWT_SECRET="asdk4923078sdkfjnbg;kljdtg1908234n1lik523fasdgf2jsabnd3893jvaso213dtn[]]be5r90ew5b"

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;
    
   
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Todos los campos son requeridos" 
      });
    }

    const oldUser = await User.findOne({ email: email });
    if (oldUser) {
      return res.status(409).json({ 
        success: false,
        message: "El usuario ya existe" 
      });
    }

   
    const encryptedPassword = await bcrypt.hash(password, 10);


    const newUser = await User.create({
      name: name,
      email: email,
      mobile: mobile,
      password: encryptedPassword, // Corregido el typo aquí
    });

    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      mobile: newUser.mobile,
      createdAt: newUser.createdAt
    };

    res.status(201).json({ 
      success: true,
      message: "Usuario registrado exitosamente",
      data: userResponse
    });

  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ 
      success: false,
      message: "Error en el servidor",
      error: error.message 
    });
  }

});

//Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son requeridos"
      });
    }

   
    const user = await User.findOne({ email: email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas"
      });
    }

    const token = jwt.sign(
      { 
        email: user.email,
        userId: user._id 
      }, 
      JWT_SECRET,
      { expiresIn: '1h' } 
    );

    res.status(200).json({
      success: true,
      message: "Login exitoso",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: error.message
    });
  }
});

//User
app.post("/api/userdata", async(req,res)=>{
  const {token}= req.body;
  try{
    const user = jwt.verify(token,JWT_SECRET);
    const useremail = user.email

    User.findOne({email: useremail}).then((data)=>{
      return res.send({status: "Ok", data: data});
    });
  } catch (error){
    return res.send({error: error});
  }
})
//Update User
app.put("/api/updateUser", upload.single("image"), async (req, res) => {
  try {
    const { token, name, mobile, gender, password } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!token) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

   
    if (name) user.name = name;
    if (mobile) user.mobile = mobile;
    if (gender) user.gender = gender;
    if (image) user.image = image;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.status(200).json({ status: "ok", message: "User updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

////********************************************////
// Rutas
app.get("/", (req, res) => {
    res.send("API de Reviews y Upvotes");
});

        //CRUD Bar //
////********************************************////

//Crear
app.post("/api/bars", upload.single("image"), async (req, res) => {
  try {
    const { name, address, phonenumber, rating } = req.body;
    const image = req.file ? req.file.filename : null;

    const newBar = new Bar({
      name,
      address,
      phonenumber,
      rating,
      image
    });

    await newBar.save();
    res.status(201).json({ message: "Bar creado exitosamente", bar: newBar });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el bar", error });
  }
});

//Agarrar todos los bares
app.get("/api/bars", async (req, res) => {
  try {
    const bars = await Bar.find();
    res.status(200).json(bars);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los bares", error });
  }
});

// bar X nombre
app.get("/api/bars/search", async (req, res) => {
  try {
    const { name } = req.query; // Obtener el nombre desde los parámetros de la consulta
    if (!name) {
      return res.status(400).json({ message: "Se requiere un nombre para buscar" });
    }

    const bars = await Bar.find({ name: { $regex: name, $options: 'i' } }); // Búsqueda insensible a mayúsculas
    if (bars.length === 0) {
      return res.status(404).json({ message: "No se encontraron bares con ese nombre" });
    }

    res.status(200).json(bars);
  } catch (error) {
    res.status(500).json({ message: "Error al buscar los bares", error });
  }
});


//Barr X Id
app.get("/api/bars/:id", async (req, res) => {
  try {
    const bar = await Bar.findById(req.params.id);
    if (!bar) {
      return res.status(404).json({ message: "Bar no encontrado" });
    }
    res.status(200).json(bar);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el bar", error });
  }
});

//Update
app.put("/api/bars/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, address, phonenumber, rating } = req.body;
    const image = req.file ? req.file.filename : null;

    const updatedBar = await Bar.findByIdAndUpdate(
      req.params.id,
      { name, address, phonenumber, rating, image },
      { new: true }
    );

    if (!updatedBar) {
      return res.status(404).json({ message: "Bar no encontrado" });
    }

    res.status(200).json({ message: "Bar actualizado exitosamente", bar: updatedBar });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el bar", error });
  }
});

//DELETE

app.delete("/api/bars/:id", async (req, res) => {
  try {
    const deletedBar = await Bar.findByIdAndDelete(req.params.id);
    if (!deletedBar) {
      return res.status(404).json({ message: "Bar no encontrado" });
    }
    res.status(200).json({ message: "Bar eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el bar", error });
  }
});


////********************************************////



        //MENU //
////********************************************////

// bebidas alcoholicas del bar
app.get("/api/bars/:barId/alcoholic-drinks", async (req, res) => {
    try {
      const barId = req.params.barId;
      console.log("Requested barId:", barId); // Debug log
      const drinks = await DrinkItem.find({ bar: barId, isAlcoholic: true });
      console.log("Drinks found:", drinks); // Debug log
      if (drinks.length === 0) {
        return res.status(404).json({ message: "No se encontraron bebidas alcohólicas para este bar" });
      } 
      res.status(200).json(drinks);
    } catch (error) {
      console.error("Error al obtener bebidas alcohólicas:", error);
      res.status(500).json({ message: "Error al obtener bebidas alcohólicas", error });
    }
  });

// CREATE item
app.post("/api/bars/:barId/menu", upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, itemType } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const barId = req.params.barId;

    // Verificar existencia del bar
    const bar = await Bar.findById(barId);
    if (!bar) {
      return res.status(404).json({ 
        success: false,
        message: "Bar no encontrado" 
      });
    }

    let newItem;
    
    if (itemType === "food") {
      newItem = new FoodItem({
        bar: barId,
        name,
        description,
        price,
        image,
        isVegetarian: req.body.isVegetarian === "true",
        calories: req.body.calories ? parseInt(req.body.calories) : null,
        category: req.body.category
      });
    } 
    else if (itemType === "drink") {
      newItem = new DrinkItem({
        bar: barId,
        name,
        description,
        price,
        image,
        isAlcoholic: req.body.isAlcoholic === "true",
        alcoholPercentage: req.body.isAlcoholic === "true" ? parseFloat(req.body.alcoholPercentage) : null,
        volume: parseInt(req.body.volume),
        category: req.body.category,
        servingTemperature: req.body.servingTemperature
      });
    } 
    else {
      return res.status(400).json({ 
        success: false,
        message: "Tipo de ítem inválido" 
      });
    }

    await newItem.save();

    res.status(201).json({ 
      success: true,
      message: "Ítem creado exitosamente",
      data: newItem
    });

  } catch (error) {
    console.error("Error al crear ítem:", error);
    res.status(500).json({ 
      success: false,
      message: "Error interno del servidor",
      error: error.message 
    });
  }
});

//menu X bar
app.get("/api/bars/:barId/menu", async (req, res) => {
  try {
    const barId = req.params.barId;
    const { type } = req.query;

    
    let query = { bar: barId };
    if (type) {
      query.itemType = type === 'food' ? 'FoodItem' : 'DrinkItem';
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      BaseItem.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      BaseItem.countDocuments(query)
    ]);
    
    const result = {};
    if (!type) {
      items.forEach(item => {
        const type = item.itemType === 'FoodItem' ? 'food' : 'drink';
        if (!result[type]) result[type] = [];
        result[type].push(item);
      });
    } else {
      result.items = items;
    }

    res.status(200).json({
      success: true,
      data: result,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error al obtener menú:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener el menú",
      error: error.message 
    });
  }
});

//item x id
app.get("/api/menu/:itemId", async (req, res) => {
  try {
    const item = await BaseItem.findById(req.params.itemId).populate("bar", "name address");

    if (!item) {
      return res.status(404).json({ 
        success: false,
        message: "Ítem no encontrado" 
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });

  } catch (error) {
    console.error("Error al obtener ítem:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener el ítem",
      error: error.message 
    });
  }
});

//Buscar item x nombre en un bar en especifico
app.get("/api/bars/:barId/menu/search", async (req, res) => {
  try {
    const { barId } = req.params;
    const { q, type, minPrice, maxPrice } = req.query;


    const barExists = await Bar.exists({ _id: barId });
    if (!barExists) {
      return res.status(404).json({
        success: false,
        message: "Bar no encontrado"
      });
    }

   
    const query = { bar: barId };

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    if (type) {
      query.itemType = type === 'food' ? 'FoodItem' : 'DrinkItem';
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

  
    const results = await BaseItem.find(query)
      .sort({ price: 1, name: 1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error en la búsqueda",
      error: error.message
    });
  }
});

//UPDATE item
app.put("/api/menu/:itemId", upload.single("image"), async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { itemType } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    // Obtener el ítem actual para determinar su tipo
    const currentItem = await BaseItem.findById(itemId);
    if (!currentItem) {
      return res.status(404).json({ 
        success: false,
        message: "Ítem no encontrado" 
      });
    }

    const updateData = {
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.description && { description: req.body.description }),
      ...(req.body.price && { price: req.body.price }),
      ...(image && { image }),
      ...(req.body.isAvailable !== undefined && { isAvailable: req.body.isAvailable === "true" })
    };

    if (itemType === "food" || currentItem.itemType === "FoodItem") {
      updateData.foodDetails = {
        isVegetarian: req.body.isVegetarian === "true",
        calories: req.body.calories ? parseInt(req.body.calories) : null,
        category: req.body.category
      };
    } 
    else if (itemType === "drink" || currentItem.itemType === "DrinkItem") {
      updateData.drinkDetails = {
        isAlcoholic: req.body.isAlcoholic === "true",
        alcoholPercentage: req.body.isAlcoholic === "true" ? parseFloat(req.body.alcoholPercentage) : null,
        volume: parseInt(req.body.volume),
        category: req.body.category,
        servingTemperature: req.body.servingTemperature
      };
    }

    let updatedItem;
    if (currentItem.itemType === "FoodItem") {
      updatedItem = await FoodItem.findByIdAndUpdate(itemId, updateData, { 
        new: true, 
        runValidators: true 
      });
    } else {
      updatedItem = await DrinkItem.findByIdAndUpdate(itemId, updateData, { 
        new: true, 
        runValidators: true 
      });
    }

    res.status(200).json({
      success: true,
      message: "Ítem actualizado exitosamente",
      data: updatedItem
    });

  } catch (error) {
    console.error("Error al actualizar ítem:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al actualizar el ítem",
      error: error.message 
    });
  }
});

//DELELTE
app.delete("/api/menu/:itemId", async (req, res) => {
  try {
    const item = await BaseItem.findByIdAndDelete(req.params.itemId);

    if (!item) {
      return res.status(404).json({ 
        success: false,
        message: "Ítem no encontrado" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Ítem eliminado exitosamente"
    });

  } catch (error) {
    console.error("Error al eliminar ítem:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al eliminar el ítem",
      error: error.message 
    });
  }
});


////********************************************////


                //Reviews CRUD
////********************************************////

//CREATE
app.post("/api/reviews", async (req, res) => {
  const { token, barId, rating, comment } = req.body;

  try {
    // checa token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Crea reseña
    const newReview = new Review({
      user: user._id,  // ID del usuario
      bar: barId,      // ID del bar
      rating,
      comment
    });

    await newReview.save();

    res.status(201).json({ message: "Reseña creada exitosamente", review: newReview });
  } catch (error) {
    res.status(500).json({ message: "Error al crear la reseña", error });
  }
});

// Review X Bar
app.get("/api/bars/:id/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({ bar: req.params.id }).populate('user', 'name email');  // Llenar los datos del usuario

    if (reviews.length === 0) {
      return res.status(404).json({ message: "No se encontraron reseñas para este bar" });
    }

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las reseñas", error });
  }
});

// Reseña X Usuario
app.get("/api/users/reviews", async (req, res) => {
  const { token } = req.body;

  try {

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

 
    const reviews = await Review.find({ user: user._id }).populate('bar', 'name');  // Llenar los datos del bar

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las reseñas", error });
  }
});

// UPDATE 
app.put("/api/reviews/:id", async (req, res) => {
  const { token, rating, comment } = req.body;

  try {
   
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

   
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

   
    if (review.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "No puedes editar esta reseña" });
    }

   
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    await review.save();

    res.status(200).json({ message: "Reseña actualizada exitosamente", review });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la reseña", error });
  }
});

// DELETE
app.delete("/api/reviews/:id", async (req, res) => {
  const { token } = req.body;

  try {
  
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

  
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    if (review.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "No puedes eliminar esta reseña" });
    }

    await review.delete();

    res.status(200).json({ message: "Reseña eliminada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la reseña", error });
  }
});


////********************************************////

                //COMMENTARIOS Y UPVOTES EN REVIEWS
////********************************************////

//CREAR
app.post("/api/reviews/:id/comments", async (req, res) => {
  const { token, comment } = req.body;
  const reviewId = req.params.id;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const newComment = new Comment({
      user: user._id,
      review: reviewId,
      comment
    });

    await newComment.save();

    res.status(201).json({ message: "Comentario creado exitosamente", comment: newComment });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el comentario", error });
  }
});
// UPDATE
app.put("/api/reviews/:id", async (req, res) => {
  const { token, rating, comment } = req.body;

  try {
   
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }


    if (review.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "No puedes editar esta reseña" });
    }

    
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;


    await review.save();

    res.status(200).json({ message: "Reseña actualizada exitosamente", review });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la reseña", error });
  }
});

//DELETE
app.delete("/api/reviews/:id", async (req, res) => {
  const { token } = req.body;

  try {
  
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }
    if (review.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "No puedes eliminar esta reseña" });
    }

    await review.delete();

    res.status(200).json({ message: "Reseña eliminada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la reseña", error });
  }
});


// Comentarios en un review
app.get("/api/reviews/:id/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ review: req.params.id }).populate('user', 'name email');

    if (comments.length === 0) {
      return res.status(404).json({ message: "No se encontraron comentarios para esta reseña" });
    }

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error al obtener los comentarios:", error); 
    res.status(500).json({ message: "Error al obtener los comentarios", error: error.message });
  }
});


//Hacer el upvote
app.post("/api/reviews/:id/upvotes", async (req, res) => {
  const { user_id } = req.body;
  const reviewId = req.params.id;

  try {
    const existingUpvote = await UpvoteReview.findOne({ user_id, review_id: reviewId });

    if (existingUpvote) {
      // Ya existe, lo quitamos (unlike)
      await UpvoteReview.deleteOne({ _id: existingUpvote._id });
      return res.status(200).json({ liked: false, message: "Upvote removed" });
    } else {
      // No existe, lo creamos (like)
      const newUpvote = new UpvoteReview({ user_id, review_id: reviewId });
      await newUpvote.save();
      return res.status(201).json({ liked: true, data: newUpvote });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Tdos los upvotes de un review
app.get("/api/reviews/:id/upvotes/count", async (req, res) => {
  try {
    const count = await UpvoteReview.countDocuments({ review_id: req.params.id });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

////********************************************////

                //UPVOTES (likes)
////********************************************////

// Toggle upvote (Para dar como tipo like y dislike en insta)
app.post("/api/upvotes", async (req, res) => {
  const { user_id, place_id } = req.body;

  try {
      const existingUpvote = await Upvote.findOne({ user_id, place_id });

      if (existingUpvote) {
          // Ya existe, lo quitamos (unlike)
          await Upvote.deleteOne({ _id: existingUpvote._id });
          return res.status(200).json({ liked: false, message: "Upvote removed" });
      } else {
          // No existe, lo creamos (like)
          const newUpvote = await Upvote.create({ user_id, place_id });
          return res.status(201).json({ liked: true, data: newUpvote });
      }
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

////********************************************////


                //YELP
////********************************************////
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

  //Que comida y drinks venden
  app.get('/api/bar/:id/menu', async (req, res) => {
    try {
      const { id } = req.params;
      const { locale } = req.query;
  
      if (!id) {
        return res.status(400).json({ error: "Business ID is required" });
      }
  
      // Try to get insights first
      try {
        const insightsResponse = await axios.get(
          `${YELP_BASE_URL}/${id}/insights/food_and_drinks`,
          { headers: yelpHeaders, params: { locale } }
        );
        return res.json(insightsResponse.data);
      } catch (insightsError) {
        console.log('Insights not available, falling back to basic business info...');
        
        // Fallback to regular business endpoint
        const businessResponse = await axios.get(
          `${YELP_BASE_URL}/${id}`,
          { headers: yelpHeaders }
        );
  
        // Return limited info from main business endpoint
        res.json({
          menu_highlights: businessResponse.data.categories || [],
          notice: "Full food & drinks insights require premium access",
          business_name: businessResponse.data.name,
          rating: businessResponse.data.rating,
          price_level: businessResponse.data.price
        });
      }
  
    } catch (error) {
      console.error('Food & Drinks Insights Error:', error.response?.data || error.message);
      
      const status = error.response?.status || 500;
      const errorData = {
        error: "Failed to get business information",
        details: error.response?.data || error.message
      };
  
      res.status(status).json(errorData);
    }
  });
  ////********************************************////

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
