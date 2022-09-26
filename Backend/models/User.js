const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email requis !'],
        unique: true
    },
    password: { 
        type: String, 
        required: [true, 'Mot de passe requis !'] 
    }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);