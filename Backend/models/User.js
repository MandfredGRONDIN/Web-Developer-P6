const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        // Pour éviter l'inscription avec une meme adresse
        unique: true
    },
    password: { 
        type: String, 
        required: true,
    }
});

// Pour éviter les erreur illisibles de la part de MongoDb
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);