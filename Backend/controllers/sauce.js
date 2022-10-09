const Sauce = require("../models/Sauce");
const fs = require("fs").promises;

exports.createSauce = async (req, res) => {
  try {
    // parser l'objet
    const sauceObject = JSON.parse(req.body.sauce);
    // Suppresion de l'id de l'objet et userId qui correspond au créateur de l'objet pour utiliser le token à la place
    delete sauceObject._id;
    delete sauceObject.userId;
    // Création de l'objet
    const sauce = new Sauce({
      ...sauceObject,
      // Extraction de l'userId avec le token
      userId: req.auth.userId,
      // Générer l'url de l'image
      imageUrl: `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`
    });
    // Enregistrement dans la bdd
    await sauce.save();
    return res.status(201).json({ message: "Recorded sauce" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal error" });
  }
};

exports.modifySauce = async (req, res) => {
  try {
    // Vérification si dans la modification il y as aussi une image
    const sauceObject = req.file ? {
          ...JSON.parse(req.body.sauce),
          imageUrl: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
          }`
        }
      : { ...req.body };
    // On supprime l'userId
    delete sauceObject.userId;
    let sauce = await Sauce.findOne({ _id: req.params.id });
    // Si la sauce n'existe pas/plus
    if(!sauce){
      return res.status(404).json({ message : 'Not found'});
    }
    // Si l'userId ne correspond pas à l'userId de celui qui as créer la sauce
    if (sauce.userId != req.auth.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // Si il y as une nouvelle image pour la modification on supprime l'ancienne image
    if (req.file) {
      const filename = sauce.imageUrl.split("/images/")[1];
      await fs.unlink(`images/${filename}`);
    }
    await Sauce.updateOne({ _id: req.params.id },{ ...sauceObject, _id: req.params.id });
    return res.status(200).json({ message: "Modified sauce" });
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: "Internal error" });
  }
};

exports.deleteSauce = async (req, res) => {
  try {
    let sauce = await Sauce.findOne({ _id: req.params.id });
    if(!sauce){
      return res.status(404).json({ message : 'Not found'});
    }
    if (sauce.userId != req.auth.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const filename = sauce.imageUrl.split("/images/")[1];
    await fs.unlink(`images/${filename}`);
    await Sauce.deleteOne({ _id: req.params.id });
    return res.status(200).json({ message: "Sauce removed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal error" });
  }
};

exports.getOneSauce = async (req, res, next) => {
  try {
    // findOne pour avoir la sauce qui correspond a l'id
    let sauce = await Sauce.findOne({ _id: req.params.id });
    if(!sauce){
      return res.status(404).json({ message : 'Not found'});
    }
    return res.status(200).json(sauce);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message : "Internal error" });
  }
};

exports.getAllSauce = async (req, res, next) => {
  try {
    let sauces = await Sauce.find();
    return res.status(200).json(sauces);
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: "Internal error" });
  }
};

exports.likeSauce = async (req, res, next) => {
  try {
    let aggregate = null;
    switch (req.body.like) {
      case 0:
        // Pour retirer le like
        let sauce = await Sauce.findOne({ id: req.params.id });
        if (sauce.usersLiked.find((user) => user === req.body.userId)) {
          aggregate = {
            $inc: { likes: -1 },
            $pull: { usersLiked: req.body.userId }
          };
        }
        // Pour retirer le dislike
        else if (sauce.usersDisliked.find((user) => user === req.body.userId)) {
          aggregate = {
            $inc: { dislikes: -1 },
            $pull: { usersDisliked: req.body.userId }
          };
        }
        break;
      case 1:
        // Pour le like
        aggregate = {
          $inc: { likes: 1 },
          $push: { usersLiked: req.body.userId }
        }
        break;
      case -1:
        // Pour le dislike
        aggregate = {
          $inc: { dislikes: 1 },
          $push: { usersDisliked: req.body.userId }
        };
        break;
    }
    if(aggregate){
      await Sauce.updateOne({ _id: req.params.id } , aggregate);
      }
    return res.status(201).json({ message : "Ok"})
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal error" });
  }
};
