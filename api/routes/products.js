const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../auth/check-auth');
const ProductsController = require('../controllers/products');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        //Allow given file.
        cb(null, true);
    }
    else {
        //Reject given file.
        cb(new Error('Image file extension not supported.'), false);
    }
};

const upload = multer({
    storage: storage, limits: {
        fileSize: 1024 * 1024 * 12,
        fileFilter: fileFilter
    }
});

router.get("/:productId", ProductsController.products_get_one);

router.get("/", ProductsController.products_get_all);

router.post("/", checkAuth, upload.single('productImage'), ProductsController.products_post);

router.patch("/:productId", checkAuth, ProductsController.products_patch);

router.delete("/:productId", checkAuth, ProductsController.products_delete);

module.exports = router;