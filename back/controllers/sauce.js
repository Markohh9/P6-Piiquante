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

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {
        ...req.body
    };

    Sauce.findOne({
            _id: req.params.id
        })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({
                    message: 'Not authorized'
                });
            } else {
                sauce.updateOne({
                        ...sauceObject
                    })
                    .then(() => res.status(200).json({
                        message: 'Objet modifié!'
                    }))
                    .catch(error => res.status(401).json({
                        error
                    }));
            }
        })
        .catch((error) => {
            res.status(400).json({
                error
            });
        });
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

exports.likeDislikeSauce = (req, res, next) => {
    const {
        like,
        dislike
    } = req.body;
    const userId = req.auth.userId;
    const sauceId = req.params.id;
    let likeValue;
    if (like !== undefined) {
        likeValue = like;
    } else if (dislike !== undefined) {
        likeValue = -dislike;
    }
    Sauce.findOne({
            _id: sauceId
        })
        .then(sauce => {
            switch (likeValue) {
                case 1:
                    if (sauce.usersLiked.find(user => user === userId)) {
                        return res.status(400).json({
                            error: 'Vous avez déjà aimé cette sauce'
                        });
                    }
                    sauce.usersLiked.push(userId);
                    break;
                case -1:
                    if (sauce.usersDisliked.find(user => user === userId)) {
                        return res.status(400).json({
                            error: 'Vous avez déjà désapprouvé cette sauce'
                        });
                    }
                    sauce.usersDisliked.push(userId);
                    break;
                case 0:
                    sauce.usersLiked = sauce.usersLiked.filter(user => user !== userId);
                    sauce.usersDisliked = sauce.usersDisliked.filter(user => user !== userId);
                    break;
                default:
                    return res.status(400).json({
                        error: 'Valeur de "like" ou "dislike" non valide'
                    });
            }
            sauce.save()
                .then(() => res.status(200).json({
                    message: 'Le like ou dislike a bien été enregistré !'
                }))
                .catch(error => res.status(400).json({
                    error
                }));
        })
        .catch(error => res.status(500).json({
            error
        }));
};