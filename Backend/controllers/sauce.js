const Sauce = require('../models/sauceModels')

exports.createSauce = (req, res, next) => {
    delete req.body._id;
    const sauce = new Sauce({
      ...req.body
    });
    sauce.save()
      .then(() => res.status(201).json({ message: "objet enregistré" }))
      .catch((error) => res.status(400).json({ error }));
  };

exports.modifySauce = (req, res, next) => {
    Sauce.updateOne({ _id: req.params.id }),
      { ...req.body, _id: req.params.id }
        .then(() => res.status(200).json({ message: "Objet modifié" }))
        .catch((error) => res.status(400).json({ error }));
  };

exports.deleteSauce = (req, res, next) => {
    Sauce.deleteOne({ _id: req.params.id })
      .then(() => res.status(200).json({ message: "objet delete" }))
      .catch((error) => res.status(400).json({ error }));
  };

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => res.status(200).json(sauce))
      .catch((error) => res.status(404).json({ error }));
  }; 

exports.getAllSauce = (req, res, next) => {
    Sauce.find()
      .then((sauces) => res.status(200).json(sauces))
      .catch((error) => res.status(400).json({ error }));
  };