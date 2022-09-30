const Sauce = require('../models/Sauce')
const fs = require('fs').promises

exports.createSauce = async (req, res) => {
  try {
    // parser l'objet
    const sauceObjet = JSON.parse(req.body.sauce);
    // Suppresion de l'id de l'objet et userId qui correspond au créateur de l'objet pour utiliser le token à la place
    delete sauceObjet._id;
    delete sauceObjet.userId;
    // Création de l'objet
    const sauce = new Sauce({
      ...sauceObjet,
      // Extraction de l'userId avec le token
      userId: req.auth.userId,
      // Générer l'url de l'image
      imageUrl: `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`,
    });
    // Enregistrement dans la bdd
    sauce.save();
    return res.status(201).json({ message: "Sauce enregistrée !" });
  } catch (e) {
    console.error(e);
    return (error) => res.status(500).json({ message: "Donnée incorrect" });
  }
};

exports.modifySauce = async (req, res) => {
  try {
    const sauceObject = req.file ? {
          ...JSON.parse(req.body.sauce),
          imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
        } : { ...req.body };
    delete sauceObject.userId;
    let sauce = await Sauce.findOne({ _id: req.params.id });
    if (sauce.userId != req.auth.userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }
    if (req.file) {
      const filename = sauce.imageUrl.split("/images/")[1];
      await fs.unlink(`images/${filename}`);
      await Sauce.updateOne({ _id: req.params.id },{ ...sauceObject, _id: req.params.id });
    } else {
      await Sauce.updateOne({ _id: req.params.id },{ ...sauceObject, _id: req.params.id });
    }
    return res.status(200).json({ message: "Sauce modifiée !" });
  } catch (e) {
    return res.status(401).json({ message: "internal error" });
  }
};

exports.deleteSauce = async (req, res) => {
  try {
    let sauce = await Sauce.findOne({_id: req.params.id})
    if(sauce.userId != req.auth.userId){
      return res.status(401).json({message: 'Non autorisé'})
    }
    const filename = sauce.imageUrl.split('/images/')[1];
    await fs.unlink(`images/${filename}`);
    await Sauce.deleteOne({_id: req.params.id})
    return res.status(200).json({ message :'La sauce a bien été suprimmée !'})
  } catch(err) {
    console.error(err);
    return res.status(500).json({ message: "Internal error" })
  }
}

exports.getOneSauce = async (req, res, next) => {
  try{
    // findOne pour avoir la sauce qui correspond a l'id
    let sauce = await Sauce.findOne({ _id: req.params.id })
    return res.status(200).json(sauce)
  } catch(e) {
    console.error(e)
    return res.status(404).json({ error })
  }
  }; 

exports.getAllSauce = async (req, res, next) => {
  try{
    let sauces = await Sauce.find()
    return res.status(200).json(sauces)
  } catch(e){
    return res.status(404).json({message : 'Pas de sauces'})
  }
};