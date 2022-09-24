const bcrypt = require('bcrypt');

const User = require('../models/User');

exports.login = (req, res, next) => {
    User.findOne({email: req.body.email})
    .then(user => {
        if(user === null){
            res.status(401).json({message: 'Identifiant ou mdp incorrecte'})
        } else {
            bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if(!valid){
                    res.status(401).json({message: 'Identifiant ou mdp incorrecte'})
                } else {
                    res.status(200).json({
                        userId: user._id,
                        token:'TOKEN'
                    })
                }
            })
            .catch(error => {
                res.status(500).json({error});
            })
        }
    })
    .catch(error => {
        res.status(500).json({error})
    })
};