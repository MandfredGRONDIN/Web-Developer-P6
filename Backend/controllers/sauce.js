const Sauce = require('../models/sauceModels')
const fs = require('fs')

exports.createSauce = (req, res, next) => {
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
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  })
  // Enregistrement dans la bdd
  sauce.save()
  .then(() => { res.status(201).json({message: 'Sauce enregistrée !'})})
  .catch(error => res.status(400).json({error}))
  };

exports.modifySauce = (req, res, next) => {
  // Savoir si le changement contient aussi un objet(image), si non : recup de l'objet directement dans le corps de la requete
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  // Supprimer le userId pour éviter que qqn crée un produit à son nom puis le modifie pour le réassigner a qqn d'autre
  delete sauceObject.userId;
  // Chercher l'objet dans la base de donnée
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // Vérification si bon utilisateur
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Non autorisé' })
      } else {
        // Suppression de l'image
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`,() => {
          // Mettre à jour l'enregistrement
          Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
          .catch(error => res.status(401).json({ error }))})
      }
    })
    .catch(error => res.status(400).json({ error }))
};

exports.deleteSauce = (req, res, next) => {
  // findOne pour avoir la sauce qui correspond a l'id
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
      // Si l'userId != a l'userId du token, Non autorisation pour le delete
      if(sauce.userId != req.auth.userId){
        res.status(401).json({message: 'Non autorisé'})
      } else {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({_id: req.params.id})
          .then(() => res.status(200).json({ message :'La sauce a bien été suprimmée !'}))
          .catch(error => res.status(401).json({error}))
        })
      }
    })
    .catch( error => res.status(500).json({error}))
  };

exports.getOneSauce = (req, res, next) => {
  // findOne pour avoir la sauce qui correspond a l'id
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => res.status(200).json(sauce))
      .catch((error) => res.status(404).json({ error }));
  }; 

exports.getAllSauce = (req, res, next) => {
  // find pour avoir la liste complete des sauces
    Sauce.find()
      .then((sauces) => res.status(200).json(sauces))
      .catch((error) => res.status(400).json({ error }));
  };