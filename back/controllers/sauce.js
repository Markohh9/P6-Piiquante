const Sauce = require('../models/sauce');
const fs = require('fs');


/* crud */
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject.userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
    });

    sauce.save()
        .then(() => {
            res.status(201).json({
                message: 'Objet enregistré !'
            })
        })
        .catch(error => {
            res.status(400).json({
                error
            })
        });
};



// faire comme le delet pour suppr l'image si une autre img est ajouté
/* Supprimer la version de l'image d'avant lors de la modif de celle ci + ne pas etre capable d'ajouter un like avec postman ou talendapi lorsqu'on a dislike et vice verse" */
exports.modifySauce = (req, res, next) => {
    if (req.file) {
        // si l'image est modifiée, il faut supprimer l'ancienne image dans le dossier /image
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    // une fois que l'ancienne image est supprimée dans le dossier /image, on peut mettre à jour le reste
                    const sauceObject = {
                        ...JSON.parse(req.body.sauce),
                        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                    }
                    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Sauce modifiée!' }))
                        .catch(error => res.status(400).json({ error }));
                })
            })
            .catch(error => res.status(500).json({ error }));
    } else {
        // si l'image n'est pas modifiée
        const sauceObject = { ...req.body };
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce modifiée!' }))
            .catch(error => res.status(400).json({ error }));
    }
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({
            _id: req.params.id
        })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({
                    message: 'Not authorized'
                });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    sauce.deleteOne({
                            _id: req.params.id
                        })
                        .then(() => {
                            res.status(200).json({
                                message: 'Objet supprimé !'
                            })
                        })
                        .catch(error => res.status(401).json({
                            error
                        }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({
                error
            });
        });
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};;

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then((sauces) => res.status(200).json(sauces))
        .catch(error => res.status(400).json({
            error
        }));
};

exports.likeDislikeSauce = (req, res) => {
    Sauce.findOne({ _id: req.params.id})
        .then((sauce) => {
            switch (req.body.like) {
                case 1:
                    if (!sauce.usersLiked.includes(req.body.userId) && !sauce.usersDisliked.includes(req.body.userId)) {
                        Sauce.updateOne(
                            {_id: req.params.id},
                            {
                                $inc: {likes: 1},
                                $push: {usersLiked: req.body.userId}
                            }
                        )
                            .then(() => res.status(201).json({ message: "Sauce liked +1" }))
                            .catch((error) => res.status(400).json({ error }));
                    }
                    break;
                    
                case -1:
                    if (!sauce.usersDisliked.includes(req.body.userId) && !sauce.usersLiked.includes(req.body.userId)) {
                        Sauce.updateOne(
                            {_id: req.params.id},
                            {
                                $inc: {dislikes: 1},
                                $push: {usersDisliked: req.body.userId}
                            }
                        )
                            .then(() => res.status(201).json({ message: "Sauce disliked +1" }))
                            .catch((error) => res.status(400).json({ error }));
                    }
                    break;
                    
                case 0:
                    if(sauce.usersLiked.includes(req.body.userId)){
                        Sauce.updateOne(
                            {_id: req.params.id},
                            {
                                $inc: {likes: -1},
                                $pull: {usersLiked: req.body.userId}
                            }
                        )
                            .then(() => res.status(201).json({ message: "Sauce liked 0"}))
                            .catch((error) => res.status(400).json({error}));
                    }

                    if(sauce.usersDisliked.includes(req.body.userId)){
                        Sauce.updateOne(
                            {_id: req.params.id},
                            {
                                $inc: {dislikes: -1},
                                $pull: {usersDisliked: req.body.userId}
                            }
                        )
                            .then(() => res.status(201).json({ message: "Sauce disliked 0"}))
                            .catch((error) => res.status(400).json({error}));
                    }
                    break;
            }
        })
        .catch((error) => res.status(404).json({error}));
};