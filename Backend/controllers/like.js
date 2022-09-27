const FicheSauce = require("../models/sauceModels");

exports.likeFicheUser = (req, res, next) => {

  FicheSauce.findOne({ id: req.params.id })
    .then((objet) => {
      switch (req.body.like) {
        // Cas du like donc on fait +1
        case 1:
          if (!objet.usersLiked.includes(req.body.userId) && req.body.like === 1){
            FicheSauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { likes: 1 },
                $push: { usersLiked: req.body.userId },
              })
              .then(() => res.status(201).json({ message: "FicheUser like +1" }))
              .catch((error) => res.status(400).json({ error }));
          }
          break;
        // Cas du dislike donc on fait -1
        case -1:
          if (!objet.usersDisliked.includes(req.body.userId) &&req.body.like === -1) {
            FicheSauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { dislikes: 1 },
                $push: { usersDisliked: req.body.userId },
              }
            )
              .then(() =>res.status(201).json({ message: "FicheUser disliked +1" }))
              .catch((error) => res.status(400).json({ error }));
          }
          break;
        // Cas ou on like ou dislike de nouveau pour remettre à 0
        case 0:
        // On retire le like
          if (objet.usersLiked.includes(req.body.userId)) {
            FicheSauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { likes: -1 },
                $pull: { usersLiked: req.body.userId },
              }
            )
              .then(() => res.status(201).json({ message: "FicheUser like 0" }))
              .catch((error) => res.status(400).json({ error }));
            break;
          }
        // On retire le dislike
          if (objet.usersDisliked.includes(req.body.userId)) {
            FicheSauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { dislikes: -1 },
                $pull: { usersDisliked: req.body.userId },
              }
            )
              .then(() =>res.status(201).json({ message: "FicheUser disliked 0" }))
              .catch((error) => res.status(400).json({ error }));
            break;
          }
      }
    })
    .catch((error) => res.status(404).json({ error }));
};
