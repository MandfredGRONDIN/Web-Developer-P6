const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauce");
const path = require('path');
require('dotenv').config()

const app = express();

mongoose.connect(`mongodb+srv://${process.env.DB}`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connection to MongoDB successful !"))
  .catch(() => console.log("Connection to MongoDB failed !"));

app.use((req, res, next) => {
  // Accéder à notre API depuis n'importe quel origine
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Ajouter les headers mentionnés aux requêtes envoyées vers notre API
  res.setHeader("Access-Control-Allow-Headers","Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
  // Envoyer des requêtes avec les méthodes mentionnées
  res.setHeader("Access-Control-Allow-Methods","GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// Transformer en json
app.use(express.json());

// Routes Authentification
app.use("/api/auth", userRoutes);

// Routes Sauces
app.use('/api/sauces', sauceRoutes);

// Routes des static (images)
app.use('/images', express.static(path.join(__dirname, 'images')))


module.exports = app;