const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});

module.exports = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        const isValid = !!MIME_TYPES[file.mimetype];
        let error = isValid ? null : new Error('Mimetype non valide');
        callback(error, isValid);
    }
}).single('image');
