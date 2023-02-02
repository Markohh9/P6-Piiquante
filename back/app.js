require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const path = require('path');



const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');
const cp = require('fs');

const myUsernameDb = process.env.DB_USERNAME
const myPasswordDb = process.env.DB_PASSWORD
const uri = `mongodb+srv://${myUsernameDb}:${myPasswordDb}@cluster0.57yfaqa.mongodb.net/?retryWrites=true&w=majority`

mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(cors());

app.use(express.json());

app.use(bodyParser.json());

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;