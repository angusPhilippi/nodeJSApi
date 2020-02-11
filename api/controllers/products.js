const Product = require('../models/product');
const mongoose = require('mongoose');

exports.products_get_one = (req, res, next) => {
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
}

exports.products_get_all = (req, res, next) => {
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
}

exports.products_post = (req, res, next) => {
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
}

exports.products_patch = (req, res, next) => {
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
}

exports.products_delete = (req, res, next) => {
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
}
