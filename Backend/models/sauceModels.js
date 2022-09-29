const mongoose = require('mongoose');

// Utilisation de mongoose pour créer le schema de donnée
const sauceSchema = mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    manufacturer: {type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageUrl: { type: String, required: true },
    heat: { type: Number, required: true },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    // type: [String] pour créer un tableau comprenant du String
    usersLiked: { type: [String], required: false },
    usersDisliked: { type: [String], required: false }
})

// Export du modele ( le nom du type(model) , le schema qu'on va utiliser )
module.exports = mongoose.model('Sauce', sauceSchema);