const Sauce = require('../models/sauces');
const fs = require('fs');


//Création d'une nouvelle sauce

exports.creationSauce = (req, res, next) =>{
  const sauceObjet = JSON.parse(req.body.sauce);
  delete sauceObjet._id;
  const sauce = new Sauce({
    ...sauceObjet,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  });
  sauce.save()
    .then(() => res.status(201).json({message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({ error}))
}


//Affichage des sauces sur la home

exports.affichesSauces = (req, res, next) =>{
  Sauce.find()
  .then(sauces => res.status(200).json(sauces))
  .catch(error => res.status(400).json({
    error}));
}

//Affichage detail de la sauce

exports.afficheSauce = (req, res, next) =>{
  Sauce.findOne({ _id: req.params.id})
  .then(sauces => res.status(200).json(sauces))
  .catch(error => res.status(400).json({
    error}));
}

//modification de la sauce

exports.modifySauce = (req, res, next) => {
  const SauceObject = req.file ? // si req.file existe
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body } // si il n'existe pas on fait une copie de req.body;
  Sauce.updateOne({ _id: req.params.id }, 
    { 
      ...SauceObject, 
      _id: req.params.id, 
      likes: 0,
      dislikes: 0,
      usersLiked: [],
      usersDisliked: [],
    })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }));
};


//suppresion de la sauce


exports.supprSauce = (req, res, next) => {
  console.log( Sauce.findOne({_id: req.params.id}))
  Sauce.findOne({_id: req.params.id}) //l'id de l'objet Sauce avec le même que le parametre de la requete id
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({
            _id: req.params.id})
          .then(() => res.status(200).json({message: 'Sauce supprimée !'}))
          .catch(error => res.status(400).json({error}));
      });
    })
    .catch(error => res.status(500).json({error}));
};

//Like and dislike Sauce

exports.likeDislike = (req, res, next) => {

  console.log(req.body)

  let like = req.body.like
  let userId = req.body.userId

  if (like === 1) { 
    Sauce.updateOne({_id: req.params.id}, 
      {
        $push: {usersLiked: userId},
        $inc: {likes: +1},
      })

      .then(() => res.status(200).json({
        message: 'Like ajouté !'
      }))
      .catch((error) => res.status(400).json({error}))
  }

  if (like === -1) {
    Sauce.updateOne( {
          _id: req.params.id}, 
        {
          $push: {usersDisliked: userId},
          $inc: {dislikes: +1},
        }
      )
      .then(() => {
        res.status(200).json({message: 'Dislike ajouté !'})
      })
      .catch((error) => res.status(400).json({error}))
  }

  if (like === 0) { 
    Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
        if (sauce.usersLiked.includes(userId)) {
          Sauce.updateOne({_id: req.params.id}, 
            {
              $pull: {usersLiked: userId},
              $inc: {likes: -1},
            })
            .then(() => res.status(200).json({message: 'Like retiré !'}))
            .catch((error) => res.status(400).json({error}))
        }
        if (sauce.usersDisliked.includes(userId)) {
          Sauce.updateOne({_id: req.params.id}, 
            {
              $pull: {usersDisliked: req.params.id},
              $inc: {dislikes: -1}, 
            })
            .then(() => res.status(200).json({message: 'Dislike retiré !'}))
            .catch((error) => res.status(400).json({error}))
        }
      })
      .catch((error) => res.status(404).json({error}))
  }
  
}
