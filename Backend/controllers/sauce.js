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
          imageUrl: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
          }`,
        }
      : { ...req.body };
    delete sauceObject.userId;
    let sauce = await Sauce.findOne({ _id: req.params.id });
    if (sauce.userId != req.auth.userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }
    if (req.file) {
      const filename = sauce.imageUrl.split("/images/")[1];
      await fs.unlink(`images/${filename}`);
    }
    await Sauce.updateOne({ _id: req.params.id },{ ...sauceObject, _id: req.params.id });
    return res.status(200).json({ message: "Sauce modifiée !" });
  } catch (e) {
    return res.status(401).json({ message: "internal error" });
  }
};

exports.deleteSauce = async (req, res) => {
  try {
    let sauce = await Sauce.findOne({ _id: req.params.id });
    if (sauce.userId != req.auth.userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }
    const filename = sauce.imageUrl.split("/images/")[1];
    await fs.unlink(`images/${filename}`);
    await Sauce.deleteOne({ _id: req.params.id });
    return res.status(200).json({ message: "La sauce a bien été suprimmée !" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal error" });
  }
};

exports.getOneSauce = async (req, res, next) => {
  try {
    // findOne pour avoir la sauce qui correspond a l'id
    let sauce = await Sauce.findOne({ _id: req.params.id });
    return res.status(200).json(sauce);
  } catch (e) {
    console.error(e);
    return res.status(404).json({ message : "Non trouvé" });
  }
};

exports.getAllSauce = async (req, res, next) => {
  try {
    let sauces = await Sauce.find();
    return res.status(200).json(sauces);
  } catch (e) {
    return res.status(404).json({ message: "Pas de sauces" });
  }
};

exports.likeSauce = async (req, res, next) => {
  try {
    switch (req.body.like) {
      case 0:
        let sauce = await Sauce.findOne({ id: req.params.id });
        if (sauce.usersLiked.find((user) => user === req.body.userId)) {
          let like = await Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: -1 },
              $pull: { usersLiked: req.body.userId },
              _id: req.params.id,
            }
          );
          if (!like) {
            return res.status(400).json({ message :'Mauvaise requête' });
          }
          return res.status(201).json({ message: "Votre avis a été pris en compte!" });
        }
        if (sauce.usersDisliked.find((user) => user === req.body.userId)) {
          let dislike = await Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: req.body.userId },
              _id: req.params.id,
            }
          );
          if (!dislike) {
            return res.status(400).json({ message :'Mauvaise requête' });
          }
          return res.status(201).json({ message: "Votre avis a été pris en compte!" });
        }
        break;
      case 1:
        let like = await Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { likes: 1 },
            $push: { usersLiked: req.body.userId },
            _id: req.params.id,
          }
        );
        if (!like) {
          return res.status(400).json({ message :'Mauvaise requête' });
        }
        return res.status(201).json({ message: "Ton like a été pris en compte !" });
      case -1:
        let dislike = await Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { dislikes: 1 },
            $push: { usersDisliked: req.body.userId },
            _id: req.params.id,
          }
        );
        if (!dislike) {
          return res.status(400).json({ message :'Mauvaise requête' });
        }
        return res.status(201).json({ message: "Ton dislike a été pris en compte !" });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal error" });
  }
};
