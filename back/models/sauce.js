const mongoose = require('mongoose');

const sauceSchema = mongoose.Schema({
  userId : {type: String, required: true},  // id of the user who create the sauce
  name: { type: String, required: true }, // Name of the sauce
  manufacturer: { type: String, required: true }, // Creator of the sauce
  description: { type: String, required: true }, // Description of the sauce
  mainPepper: { type: String, required: true }, // Main ingredient of the sauce
  imageUrl: { type: String, required: true }, // URL of the image of the sauce
  heat: { type: Number, required: true }, // Level of heat of the sauce
  likes: { type: Number, defaut: 0 }, // Number of like of the sauce
  dislikes: { type: Number, defaut: 0}, // Number of dislike of the sauce
  usersLiked: ["String <userId>"], // Array of id who liked the sauce
  usersDisliked: ["String <userId>"], // Array of id who disliked the sauce
});

module.exports = mongoose.model('Sauce', sauceSchema);