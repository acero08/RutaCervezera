const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const axios = require('axios');
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken')
const multer = require("multer");
const Events = require("./models/Events.models.js");
const Review = require("./models/Review.models.js");
const Upvote = require("./models/Upvote.models.js");
const User = require("./models/UserDetails.models.js");
const Bar = require("./models/Bar.models.js");
const Comment = require("./models/CommentReview.models.js");
const UpvoteReview = require("./models/UpvoteReview.models.js");

const BaseItem = require('./models/BaseItem.models.js');
const FoodItem = require('./models/FoodItem.models.js');
const DrinkItem = require('./models/DrinkItem.models.js');
const AlcoholicItem = require('./models/AlcoholicItem.models.js');

require('dotenv').config();
const YELP_API_KEY = process.env.YELP_API_KEY;

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
// Antes de todas las rutas


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
////********************************************////
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Nombre único para el archivo
  },
});

// Crear el middleware de upload
const upload = multer({ storage: storage });

const path = require('path');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.post('/api/users/:userId/assign-bar/:barId', async (req, res) => {
  try {
    const { userId, barId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    // Validar tipo de cuenta
    if (user.accountType !== 'business' && user.accountType !== 'admin') {
      return res.status(403).json({ success: false, message: "Este usuario no tiene permisos para gestionar bares" });
    }

    // Verificar si el bar ya está asignado
    if (user.managedBars.includes(barId)) {
      return res.status(400).json({ success: false, message: "El bar ya está asignado a este usuario" });
    }

    // Asignar el bar
    user.managedBars.push(barId);
    await user.save();

    res.status(200).json({ success: true, message: "Bar asignado exitosamente", managedBars: user.managedBars });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al asignar bar", error: error.message });
  }
});


////********************************************////

//USUARIO BAR//
////********************************************////

// Obtener el bar actual del usuario
app.get("/api/bars/current", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: "Token requerido"
      });
    }

    const token = authHeader.split(' ')[1];
    console.log("Token received:", token);

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded);

    const user = await User.findById(decoded.userId);
    console.log("User found:", user?._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    // Verificar si el usuario tiene un bar asignado
    if (!user.managedBars || user.managedBars.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No tienes un bar asignado"
      });
    }

    // Obtener el primer bar gestionado por el usuario
    const bar = await Bar.findById(user.managedBars[0]);
    console.log("Bar found:", bar?._id);

    if (!bar) {
      return res.status(404).json({
        success: false,
        message: "Bar no encontrado"
      });
    }

    // Procesar las URLs de las imágenes
    const processedBar = {
      ...bar.toObject(),
      profileImage: bar.profileImage ? `http://localhost:3000${bar.profileImage}` : null,
      coverImage: bar.coverImage ? `http://localhost:3000${bar.coverImage}` : null
    };

    res.status(200).json({
      success: true,
      data: processedBar
    });

  } catch (error) {
    console.error("Error obteniendo bar actual:", error);

    // Mejorar el manejo de errores
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Token inválido"
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "ID inválido"
      });
    }

    // Manejo genérico de errores
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});



// Actualizar el bar actual del usuario
app.put("/api/bars/current", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: "Token requerido"
      });
    }

    const token = authHeader.split(' ')[1];
    console.log("Token received:", token);

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded);

    const user = await User.findById(decoded.userId);
    console.log("User found:", user?._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    // Verificar si el usuario tiene un bar asignado
    if (!user.managedBars || user.managedBars.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No tienes un bar asignado"
      });
    }

    // Obtener el primer bar gestionado por el usuario
    const bar = await Bar.findById(user.managedBars[0]);
    console.log("Bar found:", bar?._id);

    if (!bar) {
      return res.status(404).json({
        success: false,
        message: "Bar no encontrado"
      });
    }

    // Solo actualizar los campos proporcionados
    const updateFields = {};
    const allowedFields = ['name', 'description', 'phone', 'email', 'website'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    // Usar findByIdAndUpdate con { new: true, runValidators: true }
    const updatedBar = await Bar.findByIdAndUpdate(
      bar._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    // Procesar las URLs de las imágenes
    const processedBar = {
      ...updatedBar.toObject(),
      profileImage: updatedBar.profileImage ? `http://localhost:3000${updatedBar.profileImage}` : null,
      coverImage: updatedBar.coverImage ? `http://localhost:3000${updatedBar.coverImage}` : null
    };

    res.status(200).json({
      success: true,
      data: processedBar
    });

  } catch (error) {
    console.error("Error actualizando bar actual:", error);

    // Mejorar el manejo de errores
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Token inválido"
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Datos inválidos",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    // Manejo genérico de errores
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

// Actualizar imagen del bar actual (profile o cover)
app.put("/api/bars/current/image/:type", upload.single('image'), async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const { type } = req.params;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: "Token requerido"
      });
    }

    const token = authHeader.split(' ')[1];
    console.log("Token received:", token);

    if (!['profile', 'cover'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Tipo de imagen inválido. Debe ser 'profile' o 'cover'"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se proporcionó ninguna imagen"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded);

    const user = await User.findById(decoded.userId);
    console.log("User found:", user?._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    // Verificar si el usuario tiene un bar asignado
    if (!user.managedBars || user.managedBars.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No tienes un bar asignado"
      });
    }

    // Obtener el primer bar gestionado por el usuario
    const bar = await Bar.findById(user.managedBars[0]);
    console.log("Bar found:", bar?._id);

    if (!bar) {
      return res.status(404).json({
        success: false,
        message: "Bar no encontrado"
      });
    }

    // Eliminar imagen anterior si existe
    const oldImage = type === 'profile' ? bar.profileImage : bar.coverImage;
    if (oldImage) {
      // Remover el prefijo http://localhost:3000 si existe
      const cleanPath = oldImage.replace('http://localhost:3000', '');
      const oldImagePath = path.join(__dirname, 'public', cleanPath);

      if (fs.existsSync(oldImagePath)) {
        try {
          fs.unlinkSync(oldImagePath);
          console.log("Old image deleted:", oldImagePath);
        } catch (deleteError) {
          console.error("Error deleting old image:", deleteError);
        }
      }
    }

    // Guardar nueva imagen (solo el path relativo)
    const imagePath = `/uploads/${req.file.filename}`;
    if (type === 'profile') {
      bar.profileImage = imagePath;
    } else {
      bar.coverImage = imagePath;
    }

    await bar.save();
    console.log("Bar image updated successfully");

    res.status(200).json({
      success: true,
      data: {
        [type === 'profile' ? 'profileImage' : 'coverImage']: `http://localhost:3000${imagePath}`
      }
    });

  } catch (error) {
    console.error("Error actualizando imagen del bar:", error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Token inválido"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});




////********************************************////

//ADMIN//
////********************************************////

// Middleware para verificar permisos de admin/business
const verifyAdminPermissions = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token requerido"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    if (user.accountType !== 'admin' && user.accountType !== 'business') {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para esta acción"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token inválido"
    });
  }
};

// Ruta para promover usuario a business owner
app.put("/api/promote-to-business", async (req, res) => {
  try {
    const { token, targetUserId } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token requerido"
      });
    }

    // Verificar que el usuario actual es admin
    const decoded = jwt.verify(token, JWT_SECRET);
    const adminUser = await User.findById(decoded.userId);

    if (!adminUser || adminUser.accountType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Solo los administradores pueden promover usuarios"
      });
    }

    // Buscar usuario a promover
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    // Actualizar tipo de cuenta
    targetUser.accountType = 'business';
    targetUser.permissions.canCreateBars = true;
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: "Usuario promovido a business owner exitosamente",
      data: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        accountType: targetUser.accountType
      }
    });

  } catch (error) {
    console.error("Error promoviendo usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: error.message
    });
  }
});

// Ruta para crear un bar (solo admin/business)
app.post("/api/create-bar", upload.array('images', 5), verifyAdminPermissions, async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      city,
      phone,
      email,
      website,
      openingHours,
      priceRange,
      category,
      specialties
    } = req.body;

    // Validaciones básicas
    if (!name || !address || !city) {
      return res.status(400).json({
        success: false,
        message: "Nombre, dirección y ciudad son requeridos"
      });
    }

    // Verificar si ya existe un bar con el mismo nombre en la misma ciudad
    const existingBar = await Bar.findOne({
      name: name.trim(),
      city: city.trim()
    });

    if (existingBar) {
      return res.status(409).json({
        success: false,
        message: "Ya existe un bar con este nombre en esta ciudad"
      });
    }

    // Procesar imágenes subidas
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    }

    // Crear el bar
    const newBar = await Bar.create({
      name: name.trim(),
      description: description?.trim() || '',
      address: address.trim(),
      city: city.trim(),
      phone: phone?.trim() || '',
      email: email?.trim() || '',
      website: website?.trim() || '',
      openingHours: openingHours ? JSON.parse(openingHours) : {},
      priceRange: priceRange || 'medium',
      category: category?.trim() || 'bar',
      specialties: specialties ? specialties.split(',').map(s => s.trim()) : [],
      images: imageUrls,
      owner: req.user._id,
      isActive: true
    });

    // Agregar el bar a la lista de bares gestionados del usuario
    req.user.managedBars.push(newBar._id);
    await req.user.save();

    res.status(201).json({
      success: true,
      message: "Bar creado exitosamente",
      data: newBar
    });

  } catch (error) {
    console.error("Error creando bar:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: error.message
    });
  }
});

// Ruta para obtener bares gestionados por el usuario
app.get("/api/my-bars", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token requerido"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).populate('managedBars');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    res.status(200).json({
      success: true,
      data: user.managedBars
    });

  } catch (error) {
    console.error("Error obteniendo bares:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: error.message
    });
  }
});

// Ruta para actualizar un bar (solo el owner o admin)
app.put("/api/update-bar/:barId", upload.array('images', 5), async (req, res) => {
  try {
    const { token } = req.body;
    const { barId } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token requerido"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    // Buscar el bar
    const bar = await Bar.findById(barId);
    if (!bar) {
      return res.status(404).json({
        success: false,
        message: "Bar no encontrado"
      });
    }

    // Verificar permisos (owner del bar o admin)
    if (bar.owner.toString() !== user._id.toString() && user.accountType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para actualizar este bar"
      });
    }

    // Actualizar campos
    const updateFields = [
      'name', 'description', 'address', 'city', 'phone',
      'email', 'website', 'priceRange', 'category'
    ];

    updateFields.forEach(field => {
      if (req.body[field] && req.body[field].trim()) {
        bar[field] = req.body[field].trim();
      }
    });

    // Actualizar horarios si se proporcionan
    if (req.body.openingHours) {
      bar.openingHours = JSON.parse(req.body.openingHours);
    }

    // Actualizar especialidades
    if (req.body.specialties) {
      bar.specialties = req.body.specialties.split(',').map(s => s.trim());
    }

    // Procesar nuevas imágenes
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      bar.images = [...bar.images, ...newImages];
    }

    await bar.save();

    res.status(200).json({
      success: true,
      message: "Bar actualizado exitosamente",
      data: bar
    });

  } catch (error) {
    console.error("Error actualizando bar:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: error.message
    });
  }
});

// Ruta para eliminar un bar (solo owner o admin)
app.delete("/api/delete-bar/:barId", async (req, res) => {
  try {
    const { token } = req.body;
    const { barId } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token requerido"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    const bar = await Bar.findById(barId);
    if (!bar) {
      return res.status(404).json({
        success: false,
        message: "Bar no encontrado"
      });
    }

    // Verificar permisos
    if (bar.owner.toString() !== user._id.toString() && user.accountType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para eliminar este bar"
      });
    }

    // Eliminar imágenes del servidor
    if (bar.images && bar.images.length > 0) {
      bar.images.forEach(imagePath => {
        const fullPath = path.join(__dirname, imagePath);
        if (fs.existsSync(fullPath)) {
          try {
            fs.unlinkSync(fullPath);
          } catch (error) {
            console.log("Error eliminando imagen:", error.message);
          }
        }
      });
    }

    // Eliminar bar de la lista de bares gestionados del usuario
    user.managedBars = user.managedBars.filter(id => id.toString() !== barId);
    await user.save();

    // Eliminar el bar
    await Bar.findByIdAndDelete(barId);

    res.status(200).json({
      success: true,
      message: "Bar eliminado exitosamente"
    });

  } catch (error) {
    console.error("Error eliminando bar:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: error.message
    });
  }
});

// Ruta para obtener estadísticas del bar (solo owner o admin)
app.get("/api/bar-stats/:barId", async (req, res) => {
  try {
    const { token } = req.query;
    const { barId } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token requerido"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    const bar = await Bar.findById(barId);
    if (!bar) {
      return res.status(404).json({
        success: false,
        message: "Bar no encontrado"
      });
    }

    // Verificar permisos
    if (bar.owner.toString() !== user._id.toString() && user.accountType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para ver las estadísticas de este bar"
      });
    }

    // Calcular estadísticas básicas
    const stats = {
      totalFavorites: await User.countDocuments({ favorites: barId }),
      averageRating: bar.averageRating || 0,
      totalReviews: bar.reviewCount || 0,
      createdAt: bar.createdAt,
      isActive: bar.isActive,
      viewCount: bar.viewCount || 0
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: error.message
    });
  }
});

////********************************************////

// EVENTOS //
////********************************************////

// filtrar eventos por fecha (today, next week, next month)
app.get("/api/events", async (req, res) => {
  const range = req.query.range;
  const now = new Date();
  const start = new Date(now.setHours(0, 0, 0, 0));
  let end;

  if (range === "today") {
    end = new Date();
    end.setHours(23, 59, 59, 999);
  } else if (range === "week") {
    end = new Date(start);
    end.setDate(start.getDate() + 7);
  } else if (range === "month") {
    end = new Date(start);
    end.setMonth(start.getMonth() + 1);
  } else {
    return res.status(400).json({ message: "Rango inválido" });
  }

  try {
    const events = await Events.find({ date: { $gte: start, $lte: end } });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Error encontrando los eventos: ", error: error.message });
  }
});

// filtrar eventos por bar
app.get("/api/bars/:barId/events", async (req, res) => {
  const barId = req.params.barId;
  const events = await events.find({ bar: barId });
  const range = req.query.range;
  const now = new Date();
  const start = new Date(now.setHours(0, 0, 0, 0));
  let end;

  if (range === "today") {
    end = new Date();
    end.setHours(23, 59, 59, 999);
  } else if (range === "week") {
    end = new Date(start);
    end.setDate(start.getDate() + 7);
  } else if (range === "month") {
    end = new Date(start);
    end.setMonth(start.getMonth() + 1);
  } else if (range === "all") {
    end = new Date();
    end.setFullYear(end.getFullYear() + 1);
  } else {
    return res.status(400).json({ message: "Rango inválido" });
  }

  try {
    const events = await Events.find({ date: { $gte: start, $lte: end } });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Error encontrando los eventos de este bar: ", error: error.message });
  }
});

// Crear evento
app.post("/api/bars/:barId/new-event", upload.single("image"), async (req, res) => {
  try {
    const { title, description, location, date } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const barId = req.params.barId;
    let newItem
    const bar = await Bar.findById(barId);

    if (!bar) {
      return res.status(404).json({
        success: false,
        message: "Bar no encontrado"
      });
    }

    newItem = new Events({
      bar: barId,
      title,
      description,
      location,
      date,
      image,
      createdAt: new Date()
    });

    await newItem.save();

    res.status(201).json({
      success: true,
      message: "Ítem creado exitosamente",
      data: newItem
    });
  }
  catch (error) {
    console.error("Error al crear evento:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message
    });
  }
});

// Eliminar evento
app.delete("/api/bars/:barId/events/:eventId", async (req, res) => {
  const { barId, eventId } = req.params;

  try {
    const bar = await Bar.findById(barId);
    if (!bar) {
      return res.status(404).json({ message: "Bar no encontrado" });
    }

    const event = await Events.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    await event.remove();
    res.status(200).json({ message: "Evento eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el evento", error });
  }
});

// Actualizar evento
app.put("/api/bars/:barId/events/:eventId", upload.single("image"), async (req, res) => {
  const { barId, eventId } = req.params;
  const { title, description, location, date } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const bar = await Bar.findById(barId);
    if (!bar) {
      return res.status(404).json({ message: "Bar no encontrado" });
    }

    const event = await Events.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    event.title = title || event.title;
    event.description = description || event.description;
    event.location = location || event.location;
    event.date = date || event.date;
    event.image = image || event.image;
    await event.save();

    res.status(200).json({ message: "Evento actualizado exitosamente", event });

  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el evento", error });
  }

});

////********************************************////



// FAVORITOS //
////********************************************////

// agregar / quitar de favoritos un bar
app.post('/api/users/:userId/favorites/:barId', async (req, res) => {
  try {
    const { userId, barId } = req.params;

    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    // Validate bar
    const bar = await Bar.findById(barId);
    if (!bar) {
      return res.status(404).json({ success: false, message: "Bar no encontrado" });
    }

    const alreadyFavorited = user.favorites.includes(barId);

    if (alreadyFavorited) {
      // Remove from favorites
      user.favorites = user.favorites.filter(fav => fav.toString() !== barId);
    } else {
      // Add to favorites
      user.favorites.push(barId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: alreadyFavorited ? "El bar fue eliminado de favoritos" : "El bar fue añadido a favoritos",
      data: user.favorites
    });
  } catch (error) {
    console.error("Error modifying favorites:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al modificar favoritos", 
      error: error.message 
    });
  }
});

// mostrar todos los bares que le pusiste favorito
app.get('/api/users/:userId/favorites', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate('favorites');

    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    res.status(200).json({ success: true, data: user.favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener favoritos", error: error.message });
  }
});

app.get("/bars/:barId/events", async (req, res) => {
  const { barId } = req.params;

  try {
    const events = await Event.find({ bar: barId }).populate("bar");
    res.json(events);
  } catch (error) {
    console.error("Error al obtener eventos del bar:", error);
    res.status(500).json({ error: "No se pudieron obtener los eventos del bar" });
  }
});

//TODO LO DE LOGIN Y REGISTER //
////********************************************////

const JWT_SECRET = "asdk4923078sdkfjnbg;kljdtg1908234n1lik523fasdgf2jsabnd3893jvaso213dtn[]]be5r90ew5b"

// para ver a los usuarios 
app.get("/api/users", async (req, res) => {
  try {
    const UserDetails = require('./models/UserDetails.models');
    const users = await UserDetails.find();
    if (users.length === 0) {
      return res.status(404).json({ message: "No se encontraron usuarios" });
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener a los usuarios", error: error.message });
  }
});

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
app.post("/api/userdata", async (req, res) => {
  const { token } = req.body;
  try {
    if (!token) {
      return res.status(400).json({
        status: "error",
        message: "Token requerido"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userData = await User.findById(decoded.userId);

    if (!userData) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado"
      });
    }

    // Return user data without password
    const userResponse = userData.toObject();
    delete userResponse.password;

    res.json({
      status: "ok",
      data: userResponse
    });
  } catch (error) {
    console.error("Error in /api/userdata:", error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: "error",
        message: "Token inválido"
      });
    }
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
      details: error.message
    });
  }
});

//Update User
app.put("/api/updateUser", upload.single("image"), async (req, res) => {
  try {
    console.log("Update user request received");
    console.log("Body:", req.body);
    console.log("File:", req.file ? "Image uploaded" : "No image");

    const { token, name, email, mobile, gender, currentPassword, newPassword } = req.body;

    if (!token) {
      return res.status(400).json({
        status: "error",
        message: "Token requerido"
      });
    }

    // Decodificar el token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        status: "error",
        message: "Token inválido"
      });
    }

    // Buscar usuario
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado"
      });
    }

    console.log("User found:", user.email);

    // Verificar si se está cambiando el email
    if (email && email.trim() && email !== user.email) {
      // Verificar si el nuevo email ya existe
      const emailExists = await User.findOne({ email: email.trim() });
      if (emailExists) {
        return res.status(400).json({
          status: "error",
          message: "El correo electrónico ya está en uso"
        });
      }
      user.email = email.trim();
    }

    // Verificar si se está cambiando la contraseña
    if (newPassword && newPassword.trim()) {
      if (!currentPassword) {
        return res.status(400).json({
          status: "error",
          message: "La contraseña actual es requerida"
        });
      }

      // Verificar contraseña actual
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          status: "error",
          message: "La contraseña actual es incorrecta"
        });
      }

      // Hashear nueva contraseña
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword.trim(), salt);
    }

    // Actualizar otros campos básicos
    if (name && name.trim()) user.name = name.trim();
    if (mobile && mobile.trim()) user.mobile = mobile.trim();
    if (gender && gender.trim()) user.gender = gender.trim();

    // Manejar imagen
    if (req.file) {
      console.log("Processing uploaded image:", req.file.filename);
      // Eliminar imagen anterior si existe
      if (user.image && user.image.includes('/uploads/')) {
        const oldImagePath = path.join(__dirname, user.image.replace('http://localhost:3000', ''));
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
            console.log("Old image deleted");
          } catch (error) {
            console.log("Error deleting old image:", error.message);
          }
        }
      }

      // Guardar nueva imagen - solo el path relativo
      user.image = `/uploads/${req.file.filename}`;
    }

    // Guardar cambios
    const updatedUser = await user.save();
    console.log("User updated successfully");

    // Preparar respuesta sin datos sensibles
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    // Generar nuevo token con tiempo de expiración extendido
    const newToken = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      status: "ok",
      message: "Usuario actualizado correctamente",
      user: userResponse,
      token: newToken
    });

  } catch (error) {
    console.error("Error en updateUser:", error);
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
      details: error.message
    });
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
    const {
      name,
      address,
      phone,
      city,
      description,
      email,
      website,
      category,
      priceRange,
      owner,
    } = req.body;

    const profileImage = req.file ? req.file.filename : null;

    const newBar = new Bar({
      name,
      address,
      phone,
      city,
      description,
      email,
      website,
      category,
      priceRange,
      profileImage,
      owner
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
    const drinks = await DrinkItem.find({ bar: barId, isAlcoholic: true });
    if (drinks.length === 0) {
      return res.status(404).json({ message: "No se encontraron bebidas alcohólicas para este bar" });
    }
    res.status(200).json(drinks);
  } catch (error) {
    console.error("Error al obtener bebidas alcohólicas:", error);
    res.status(500).json({ message: "Error al obtener bebidas alcohólicas", error });
  }
});

// comida del bar
app.get("/api/bars/:barId/food", async (req, res) => {
  try {
    const barId = req.params.barId;
    const food = await MenuItem.find({ bar: barId, itemType: 'food' });
    if (food.length === 0) {
      return res.status(404).json({ message: "No se encontró comida registrada para este bar" });
    }
    res.status(200).json(food);
  } catch (error) {
    console.error("Error al obtener bebidas alcohólicas:", error);
    res.status(500).json({ message: "Error al encontrar la comida registrada para este bar: ", error });
  }
});

// bebidas del bar
app.get("/api/bars/:barId/drinks", async (req, res) => {
  try {
    const barId = req.params.barId;
    const drinks = await DrinkItem.find({ bar: barId, isAlcoholic: false });
    if (drinks.length === 0) {
      return res.status(404).json({ message: "No se encontraron bebidas registradas para este bar" });
    }
    res.status(200).json(drinks);
  } catch (error) {
    res.status(500).json({ message: "Error al encontrar las bebidas registradas para este bar:", error });
  }
});

// CREATE item
app.post("/api/bars/:barId/menu", upload.single("image"), async (req, res) => {
  try {
    const { barId } = req.params;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: "Token requerido"
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    // Verificar si el usuario tiene permiso para gestionar este bar
    if (!user.managedBars || !user.managedBars.includes(barId)) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para gestionar este bar"
      });
    }

    const { name, description, price, category, itemType } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    let item;
    if (itemType === 'food') {
      const { isVegetarian, hasGluten, calories } = req.body;
      item = new FoodItem({
        name,
        description,
        price: parseFloat(price),
        category,
        image,
        bar: barId,
        isVegetarian: isVegetarian === 'true',
        hasGluten: hasGluten === 'true',
        calories: calories ? parseInt(calories) : undefined,
        createdBy: user._id
      });
    } else if (itemType === 'alcoholic') {
      const { alcoholPercentage, volume, brand, origin } = req.body;
      item = new AlcoholicItem({
        name,
        description,
        price: parseFloat(price),
        category,
        image,
        bar: barId,
        alcoholPercentage: parseFloat(alcoholPercentage),
        volume: parseInt(volume),
        brand,
        origin,
        createdBy: user._id
      });
    } else if (itemType === 'drink') {
      const { volume, servingTemperature } = req.body;
      item = new DrinkItem({
        name,
        description,
        price: parseFloat(price),
        category,
        image,
        bar: barId,
        volume: parseInt(volume),
        servingTemperature,
        createdBy: user._id
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Tipo de item inválido"
      });
    }

    await item.save();

    res.status(201).json({
      success: true,
      message: "Item creado exitosamente",
      data: item
    });

  } catch (error) {
    console.error("Error creating menu item:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear el item",
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



// GET reviews for a specific bar

app.get("/api/bars/:barId/reviews", async (req, res) => {
  try {
    console.log("Fetching reviews for bar:", req.params.barId);
    console.log("Available models check:");
    console.log("Review model:", !!Review);
    console.log("UpvoteReview model:", !!UpvoteReview);
    console.log("Comment model:", !!Comment);

    const { barId } = req.params;

    // Validate barId format solo si estás usando MongoDB ObjectId
    if (barId && barId.length === 24 && !barId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bar ID format"
      });
    }

    // Verificar si Review model existe y está disponible
    if (!Review) {
      console.error("Review model not found");
      return res.status(500).json({
        success: false,
        message: "Review model not available"
      });
    }

    console.log("Fetching reviews from database...");

    // Fetch reviews con manejo de errores mejorado
    let reviews;
    try {
      reviews = await Review.find({ bar: barId })
        .populate({
          path: 'user',
          select: 'name email image',
          options: {
            strictPopulate: false
          }
        })
        .sort({ createdAt: -1 })
        .exec();
    } catch (populateError) {
      console.error("Error with populate, trying without:", populateError);
      // Fallback sin populate
      reviews = await Review.find({ bar: barId })
        .sort({ createdAt: -1 })
        .exec();
    }

    console.log(`Found ${reviews.length} reviews`);

    // Si no hay reviews, retornar array vacío
    if (!reviews || reviews.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // Process reviews con mejor manejo de errores
    const reviewsWithData = [];

    for (const review of reviews) {
      try {
        // Handle case where user might be null
        const userInfo = review.user || {
          name: "Usuario",
          email: "",
          image: "",
          _id: null
        };

        let upvotes = 0;
        let commentCount = 0;

        // Intentar obtener conteos solo si los modelos existen
        try {
          if (UpvoteReview) {
            upvotes = await UpvoteReview.countDocuments({ review: review._id });
          }
        } catch (upvoteError) {
          console.warn("Error counting upvotes:", upvoteError);
        }

        try {
          if (Comment) {
            commentCount = await Comment.countDocuments({ review: review._id });
          }
        } catch (commentError) {
          console.warn("Error counting comments:", commentError);
        }

        reviewsWithData.push({
          _id: review._id,
          user: userInfo,
          bar: review.bar,
          rating: review.rating || 0,
          comment: review.comment || "",
          upvotes: upvotes,
          commentCount: commentCount,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt
        });

      } catch (reviewError) {
        console.error("Error processing review:", review._id, reviewError);
        // Incluir review básico en caso de error
        reviewsWithData.push({
          _id: review._id,
          user: { name: "Usuario", email: "", image: "", _id: null },
          bar: review.bar,
          rating: review.rating || 0,
          comment: review.comment || "",
          upvotes: 0,
          commentCount: 0,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt
        });
      }
    }

    res.status(200).json({
      success: true,
      data: reviewsWithData
    });

  } catch (error) {
    console.error("Error fetching reviews - Full error:", error);
    console.error("Error stack:", error.stack);

    // Respuestas de error más específicas
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error"
      });
    }

    // Error genérico
    res.status(500).json({
      success: false,
      message: "Error fetching reviews",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});


// POST - Create a new review - FIXED
app.post("/api/bars/:barId/reviews", async (req, res) => {
  try {
    const { token, rating, comment } = req.body;
    const { barId } = req.params;

    console.log("Creating review with data:", {
      barId,
      rating,
      comment: comment?.substring(0, 50) + "...",
      hasToken: !!token
    });

    // Validate barId format
    if (!barId || !barId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bar ID format"
      });
    }

    // Validaciones básicas
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required"
      });
    }

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Rating and comment are required"
      });
    }

    const numRating = parseInt(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 1 and 5"
      });
    }

    if (typeof comment !== 'string' || comment.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment must be a non-empty string"
      });
    }

    // Verify token
    let decoded;
    try {
      // Make sure JWT_SECRET is defined
      if (!process.env.JWT_SECRET && !JWT_SECRET) {
        throw new Error('JWT_SECRET not configured');
      }

      const secret = process.env.JWT_SECRET || JWT_SECRET;
      decoded = jwt.verify(token, secret);
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    // Validate decoded token structure
    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token structure"
      });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verificar que el bar existe
    const bar = await Bar.findById(barId);
    if (!bar) {
      return res.status(404).json({
        success: false,
        message: "Bar not found"
      });
    }

    // Check if user already has a review for this bar
    const existingReview = await Review.findOne({
      user: user._id,
      bar: barId
    });

    if (existingReview) {
      return res.status(409).json({ // Changed to 409 Conflict
        success: false,
        message: "You have already reviewed this bar. Use PUT to update your review."
      });
    }

    // Create review
    const newReview = new Review({
      user: user._id,
      bar: barId,
      rating: numRating,
      comment: comment.trim(),
    });

    await newReview.save();
    console.log("Review saved with ID:", newReview._id);

    // Populate the user data for the response
    await newReview.populate('user', 'name email image');

    console.log("Review created successfully:", newReview._id);

    // Return the review in the expected format
    const reviewResponse = {
      _id: newReview._id,
      user: newReview.user,
      bar: newReview.bar,
      rating: newReview.rating,
      comment: newReview.comment,
      upvotes: 0,
      commentCount: 0,
      createdAt: newReview.createdAt,
      updatedAt: newReview.updatedAt
    };

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: {
        review: reviewResponse
      }
    });

  } catch (error) {
    console.error("Error creating review - Full error:", error);
    console.error("Error stack:", error.stack);

    // More specific error handling
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// PUT - Update an existing review - CORREGIDO
app.put("/api/reviews/:reviewId", async (req, res) => {
  try {
    const { token, rating, comment } = req.body;
    const { reviewId } = req.params;

    console.log("Updating review:", reviewId);

    // Validate reviewId format
    if (!reviewId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID format"
      });
    }

    // Validaciones básicas
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required"
      });
    }

    // Verify token
    let decoded;
    try {
      const secret = process.env.JWT_SECRET || JWT_SECRET;
      decoded = jwt.verify(token, secret);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token structure"
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Ensure the user owns the review
    if (review.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this review"
      });
    }

    // Update review
    if (rating !== undefined) {
      const numRating = parseInt(rating);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be a number between 1 and 5"
        });
      }
      review.rating = numRating;
    }

    if (comment !== undefined) {
      if (typeof comment !== 'string' || comment.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Comment must be a non-empty string"
        });
      }
      review.comment = comment.trim();
    }

    await review.save();

    // Populate the user data for the response
    await review.populate('user', 'name email image');

    // Get additional data
    const upvotes = await UpvoteReview.countDocuments({ review: review._id });
    const commentCount = await Comment.countDocuments({ review: review._id });

    const reviewWithData = {
      _id: review._id,
      user: review.user,
      bar: review.bar,
      rating: review.rating,
      comment: review.comment,
      upvotes: upvotes,
      commentCount: commentCount,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt
    };

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: {
        review: reviewWithData
      }
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// DELETE - Delete a review

app.delete("/api/reviews/:reviewId", async (req, res) => {
  try {
    const { token } = req.body;
    const { reviewId } = req.params;

    console.log("Deleting review:", reviewId);

    // Validate reviewId format
    if (!reviewId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID format"
      });
    }

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required"
      });
    }

    // Verify token
    let decoded;
    try {
      const secret = process.env.JWT_SECRET || JWT_SECRET;
      decoded = jwt.verify(token, secret);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token structure"
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Ensure the user owns the review
    if (review.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this review"
      });
    }

    // Delete related data first
    await Comment.deleteMany({ review: reviewId });
    await UpvoteReview.deleteMany({ review: reviewId });

    // Delete the review
    await Review.deleteOne({ _id: reviewId });

    res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});


////********************************************////

//COMMENTARIOS Y UPVOTES EN REVIEWS
////********************************************////

app.post("/api/reviews/:reviewId/comments", async (req, res) => {
  try {
    const { token, comment } = req.body;
    const { reviewId } = req.params;

    // Validate reviewId format
    if (!reviewId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID format"
      });
    }

    if (!token || !comment) {
      return res.status(400).json({
        success: false,
        message: "Token and comment are required"
      });
    }

    if (typeof comment !== 'string' || comment.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment must be a non-empty string"
      });
    }

    // Verify token
    let decoded;
    try {
      const secret = process.env.JWT_SECRET || JWT_SECRET;
      decoded = jwt.verify(token, secret);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token structure"
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if review exists
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Create comment
    const newComment = new Comment({
      user: user._id,
      review: reviewId,
      content: comment.trim()
    });

    await newComment.save();
    await newComment.populate('user', 'name email image');

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: newComment
    });

  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});
// Obtener comentarios con paginación
app.get("/api/reviews/:reviewId/comments", async (req, res) => {
  try {
    const { reviewId } = req.params;

    console.log("Iniciando obtención de comentarios para review:", reviewId);

    // Validación mejorada del ID
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Formato de ID de reseña inválido"
      });
    }

    console.log("Buscando review en la base de datos...");
    const review = await Review.findById(reviewId).lean();

    if (!review) {
      console.log("Review no encontrada");
      return res.status(404).json({
        success: false,
        message: "Reseña no encontrada"
      });
    }

    console.log("Buscando comentarios...");
    const comments = await Comment.find({ review: reviewId })
      .populate({
        path: 'user',
        select: 'name email image',
        model: 'User' // Asegurar referencia correcta
      })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Encontrados ${comments.length} comentarios`);

    res.status(200).json({
      success: true,
      data: comments
    });

  } catch (error) {
    console.error("Error en GET /comments:", {
      message: error.message,
      stack: error.stack,
      params: req.params
    });

    res.status(500).json({
      success: false,
      message: "Error interno al obtener comentarios",
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

////********************************************////

//UPVOTES para reseñas (likes)
////********************************************////

app.post("/api/reviews/:reviewId/upvotes", async (req, res) => {
  try {
    const { token } = req.body;
    const { reviewId } = req.params;

    console.log("Upvoting review:", reviewId);

    // Validate reviewId format
    if (!reviewId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID format"
      });
    }

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required"
      });
    }

    // Verify token
    let decoded;
    try {
      const secret = process.env.JWT_SECRET || JWT_SECRET;
      decoded = jwt.verify(token, secret);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token structure"
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if review exists
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Check if user already upvoted
    const existingUpvote = await UpvoteReview.findOne({
      user: user._id,
      review: reviewId
    });

    if (existingUpvote) {
      // Remove upvote (toggle)
      await UpvoteReview.deleteOne({ _id: existingUpvote._id });
    } else {
      // Add upvote
      const newUpvote = new UpvoteReview({
        user: user._id,
        review: reviewId
      });
      await newUpvote.save();
    }

    // Get updated count
    const upvoteCount = await UpvoteReview.countDocuments({ review: reviewId });

    res.status(200).json({
      success: true,
      upvotes: upvoteCount,
      count: upvoteCount,
      message: existingUpvote ? "Upvote removed" : "Upvote added"
    });

  } catch (error) {
    console.error("Error handling upvote:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

////********************************************////

//Auth para maybe usarlo
////********************************************////
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Acceso no autorizado" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    req.user = user;
    next();
  } catch (error) {
    console.error("Error de autenticación:", error);
    res.status(401).json({ error: "Token inválido" });
  }
};


////********************************************////

// BUSINESS ENDPOINTS //
////********************************************////

// Obtener estadísticas del bar
app.get("/api/business/bar/:barId/stats", verifyAdminPermissions, async (req, res) => {
  try {
    const barId = req.params.barId;
    const user = req.user;

    // Verificar que el usuario puede gestionar este bar
    if (!user.canManageBar(barId)) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para ver las estadísticas de este bar"
      });
    }

    const bar = await Bar.findById(barId);
    if (!bar) {
      return res.status(404).json({
        success: false,
        message: "Bar no encontrado"
      });
    }

    // Obtener estadísticas
    const stats = {
      totalReviews: await Review.countDocuments({ bar: barId }),
      averageRating: bar.averageRating || 0,
      totalMenuItems: await MenuItem.countDocuments({ bar: barId }),
      totalEvents: await Events.countDocuments({ bar: barId }),
      viewCount: bar.viewCount || 0,
      // Agregar más estadísticas según necesites
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo estadísticas",
      error: error.message
    });
  }
});

// Actualizar información del bar
app.put("/api/business/bar/:barId", verifyAdminPermissions, upload.array('images', 5), async (req, res) => {
  try {
    const barId = req.params.barId;
    const user = req.user;
    const {
      name,
      description,
      address,
      city,
      phone,
      email,
      website,
      openingHours,
      priceRange,
      category,
      specialties
    } = req.body;

    // Verificar permisos
    if (!user.canManageBar(barId)) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para actualizar este bar"
      });
    }

    const bar = await Bar.findById(barId);
    if (!bar) {
      return res.status(404).json({
        success: false,
        message: "Bar no encontrado"
      });
    }

    // Actualizar campos
    if (name) bar.name = name;
    if (description) bar.description = description;
    if (address) bar.address = address;
    if (city) bar.city = city;
    if (phone) bar.phone = phone;
    if (email) bar.email = email;
    if (website) bar.website = website;
    if (openingHours) bar.openingHours = JSON.parse(openingHours);
    if (priceRange) bar.priceRange = priceRange;
    if (category) bar.category = category;
    if (specialties) bar.specialties = specialties.split(',');

    // Procesar nuevas imágenes
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      bar.images = [...bar.images, ...newImages];
    }

    await bar.save();

    res.status(200).json({
      success: true,
      message: "Bar actualizado exitosamente",
      data: bar
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error actualizando el bar",
      error: error.message
    });
  }
});

// Gestionar fotos del bar
app.post("/api/business/bar/:barId/photos", verifyAdminPermissions, upload.array('images', 10), async (req, res) => {
  try {
    const barId = req.params.barId;
    const user = req.user;

    if (!user.hasPermission('canManagePhotos')) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para gestionar fotos"
      });
    }

    const bar = await Bar.findById(barId);
    if (!bar) {
      return res.status(404).json({
        success: false,
        message: "Bar no encontrado"
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No se proporcionaron imágenes"
      });
    }

    const newImages = req.files.map(file => `/uploads/${file.filename}`);
    bar.images = [...bar.images, ...newImages];
    await bar.save();

    res.status(200).json({
      success: true,
      message: "Imágenes agregadas exitosamente",
      data: {
        images: newImages
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error subiendo imágenes",
      error: error.message
    });
  }
});

// Eliminar foto del bar
app.delete("/api/business/bar/:barId/photos/:photoId", verifyAdminPermissions, async (req, res) => {
  try {
    const { barId, photoId } = req.params;
    const user = req.user;

    if (!user.hasPermission('canManagePhotos')) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para eliminar fotos"
      });
    }

    const bar = await Bar.findById(barId);
    if (!bar) {
      return res.status(404).json({
        success: false,
        message: "Bar no encontrado"
      });
    }

    // Eliminar la imagen del array
    const imageIndex = bar.images.findIndex(img => img.includes(photoId));
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Imagen no encontrada"
      });
    }

    // Eliminar archivo físico
    const imagePath = path.join(__dirname, bar.images[imageIndex]);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Eliminar referencia de la base de datos
    bar.images.splice(imageIndex, 1);
    await bar.save();

    res.status(200).json({
      success: true,
      message: "Imagen eliminada exitosamente"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error eliminando la imagen",
      error: error.message
    });
  }
});

////********************************************////


// Obtener el menú del bar actual - FIXED
app.get("/api/bars/current/menu", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: "Token requerido"
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    // Verificar si el usuario tiene un bar asignado
    if (!user.managedBars || user.managedBars.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No tienes un bar asignado"
      });
    }

    const barId = user.managedBars[0];
    console.log("Looking for menu items with barId:", barId);

    // Obtener todos los items del menú - FIX: usar el ObjectId correcto
    const menuItems = await BaseItem.find({
      bar: barId  // Ahora usa el ObjectId real en lugar de "current"
    });

    console.log("Found menu items:", menuItems.length);

    // Separar items por tipo
    const food = menuItems.filter(item => item.itemType === 'FoodItem');
    const drinks = menuItems.filter(item => item.itemType === 'DrinkItem');
    const alcoholicDrinks = menuItems.filter(item => item.itemType === 'AlcoholicItem');

    // Procesar las URLs de las imágenes
    const processItems = (items) => {
      return items.map(item => ({
        ...item.toObject(),
        image: item.image ? `http://localhost:3000${item.image}` : null
      }));
    };

    res.status(200).json({
      success: true,
      data: {
        food: processItems(food),
        drinks: processItems(drinks),
        alcoholicDrinks: processItems(alcoholicDrinks)
      }
    });

  } catch (error) {
    console.error("Error obteniendo menú:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el menú",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

// Crear item en el menú del bar actual - FIXED
app.post("/api/bars/current/menu", upload.single("image"), async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: "Token requerido"
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    // Verificar si el usuario tiene un bar asignado
    if (!user.managedBars || user.managedBars.length === 0) {
      return res.status(403).json({
        success: false,
        message: "No tienes un bar asignado"
      });
    }

    const barId = user.managedBars[0];
    const { name, description, price, category, itemType } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    console.log("Creating item for bar:", barId);
    console.log("Item type:", itemType);

    let item;
    if (itemType === 'alcoholic') {
      const { alcoholPercentage, volume, brand, origin } = req.body;
      item = new AlcoholicItem({
        name,
        description,
        price: parseFloat(price),
        category,
        image,
        bar: barId,
        alcoholPercentage: parseFloat(alcoholPercentage),
        volume: parseInt(volume),
        brand,
        origin,
        createdBy: user._id,
        itemType: 'AlcoholicItem' // FIX: Asegurar que el itemType sea correcto
      });
    } else if (itemType === 'drink') {
      const { volume, servingTemperature } = req.body;
      item = new DrinkItem({
        name,
        description,
        price: parseFloat(price),
        category,
        image,
        bar: barId,
        volume: parseInt(volume),
        servingTemperature,
        createdBy: user._id,
        itemType: 'DrinkItem' // FIX: Asegurar que el itemType sea correcto
      });
    } else if (itemType === 'food') {
      const { isVegetarian, hasGluten, calories } = req.body;
      item = new FoodItem({
        name,
        description,
        price: parseFloat(price),
        category,
        image,
        bar: barId,
        isVegetarian: isVegetarian === 'true',
        hasGluten: hasGluten === 'true',
        calories: calories ? parseInt(calories) : undefined,
        createdBy: user._id,
        itemType: 'FoodItem' // FIX: Asegurar que el itemType sea correcto
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Tipo de item inválido"
      });
    }

    await item.save();
    console.log("Item created successfully:", item._id);

    res.status(201).json({
      success: true,
      message: "Item creado exitosamente",
      data: item
    });

  } catch (error) {
    console.error("Error creating menu item:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear el item",
      error: error.message
    });
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});