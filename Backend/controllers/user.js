const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config()

const User = require('../models/User');

exports.signup = async (req, res) => {
    try{
        let hash = await bcrypt.hash(req.body.password, 10)
        let user = await new User ({
            email: req.body.email,
            password: hash
        });
        await user.save()
        if(user){
            return res.status(201).json({message: 'Utilisateur créé !'})
        }
        return error => res.status(400).json({error})
    } catch(e) {
        console.error(e)
        return res.status(500).json({ message: 'Internal error' })
    }
}

exports.login = async (req, res) => {
    try {
        let user = await User.findOne({ email: req.body.email });
        if(!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé !' });
        }
        let valid = await bcrypt.compare(req.body.password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
        }
        return res.status(200).json({
            userId: user._id,
            token: jwt.sign(
                { userId: user._id },
                process.env.TOKEN_KEY,
                { expiresIn: '24h' }
            )
        });
    } catch(e) {
        console.error(e)
        return res.status(500).json({ message : "Internal error" })
    }
}