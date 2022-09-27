const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauce");
const path = require('path');
require('dotenv').config()

const app = express();

mongoose.connect(`mongodb+srv://${process.env.BDDemail}:${process.env.BDDmdp}@cluster0.0jmu1vj.mongodb.net/test`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers","Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods","GET, POST, PUT, DELETE, PATCH, OPTIONS");
  next();
});

app.use(express.json());

// Routes Authentification
app.use("/api/auth", userRoutes);

// Routes Sauces
app.use('/api/sauces', sauceRoutes);

// Routes des static (images)
app.use('/images', express.static(path.join(__dirname, 'images')))


module.exports = app;