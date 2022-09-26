// Importer multer
const multer = require('multer');

// Création d'un objet pour définir le format des images
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
}

// Configuration du multer pour la modif du fichier image, puis la destination
const storage = multer.diskStorage({
    
    // Destination dans le dossier /images
    destination: (req, file, callback) => {
        callback(null, 'images')
    },

    // Nouveau nom du fichier
    filename: (req, file, callback) => {

        // Remplacement des points et espaces par des underscores
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];

        // Assemblage du nouveau nom avec l'extension (nom formaté + date pour éviter l'écrasement)
        callback(null, name + Date.now() + '.' + extension)
    }
});

// Exportation de multer
module.exports = multer({ storage }).single('image');