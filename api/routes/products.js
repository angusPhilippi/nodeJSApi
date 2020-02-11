const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../auth/check-auth');

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
}

const upload = multer({
    storage: storage, limits: {
        fileSize: 1024 * 1024 * 12,
        fileFilter: fileFilter
    }
});

const Product = require('../models/product')

router.get("/", (req, res, next) => {
    Product.find()
        .select('name price _id productImage')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => ({
                    name: doc.name,
                    price: doc.price,
                    productImage: doc.productImage,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        url: `http://localhost:${process.env.PORT}/products/${doc._id}`
                    }
                }))
            }
            if (docs.length > 0) {
                res.status(200).json(response);
            }
            else {
                console.log('No entries in DB')
                res.status(200).json({ message: 'No entries found.' })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

router.post("/", checkAuth, upload.single('productImage'), (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product
        .save()
        .then(result => {
            res.status(201).json({
                message: 'Created Product Successfully',
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    request: {
                        type: 'GET',
                        url: `http://localhost:${process.env.PORT}/products/${result._id}`
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.get("/:productId", (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('name price _id productImage')
        .exec()
        .then(docs => {
            res.status(200).json({
                requestedProduct: {
                    name: docs.name,
                    price: docs.price,
                    productImage: doc.productImage,
                    _id: docs._id,
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

router.patch("/:productId", checkAuth, (req, res, next) => {
    const id = req.params.productId;
    const updateOperations = {};
    for (const operations of req.body) {
        updateOperations[operations.propertyName] = operations.value;
    }
    Product.updateOne({ _id: id }, { $set: updateOperations })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Successful update of product with ID: ' + id,
                request: {
                    type: 'GET',
                    url: `http://localhost:${process.env.PORT}/products/${id}`
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
});

router.delete("/:productId", checkAuth, (req, res, next) => {
    const id = req.params.productId
    Product.remove({
        _id: id
    })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Successful deletion of product with ID: ' + id,
                request: {
                    type: 'GET',
                    url: `http://localhost:${process.env.PORT}/products/`
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                err: error
            });
        });
});

module.exports = router;