const Order = require('../models/order');
const Product = require('../models/product');

exports.orders_get_one = (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id)
        .populate('productId')
        .exec()
        .then(doc => {
            if (doc) {
                console.log(doc)
                const response = {
                    productOrdered: {
                        name: doc.productId.name,
                        itemPrice: doc.productId.price,
                        id: doc.productId.id,
                        request: {
                            type: "GET",
                            url: `http://localhost:${(process.env.PORT)}/${doc.productId.productImage}`
                        }
                    },
                    quantity: doc.quantity,
                    orderId: doc.id,
                    orderPrice: doc.productId.price * doc.quantity
                }
                res.status(200).json(response);
            }
            else {
                res.status(200).json({
                    message: 'No entries found with id: ' + id
                });
            };
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            });
        });
}

exports.orders_get_all = (req, res, next) => {
    Order.find()
        .select('product quantity _id')
        .populate('productId')
        .exec()
        .then(docs => {
            const response = {
                orderCount: docs.length,
                orders: docs.map(doc => ({
                    productOrdered: {
                        name: doc.productId.name,
                        id: doc.productId.id
                    },
                    quantity: doc.quantity,
                    orderPrice: doc.quantity * doc.productId.price,
                    orderId: doc._id,
                    request: {
                        type: 'GET',
                        url: `http://localhost:${process.env.PORT}/orders/${doc._id}`
                    }
                }))
            }
            if (docs.length > 0) {
                res.status(200).json(response);
            }
            else {
                res.status(200).json({ message: 'No orders found.' })
            };
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
}

exports.orders_post = (req, res, next) => {
    Product.findById(req.body.productId)
        .then(product => {
            if (!product) {
                return res.status(404).json({
                    message: 'Product not found.'
                });
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                productId: req.body.productId
            });
            return order.save();
        })
        .then(result => {
            res.status(201).json({
                message: "Order stored",
                createdOrder: {
                    _id: result._id,
                    productId: result.productId,
                    quantity: result.quantity
                },
                request: {
                    type: "GET",
                    url: `http://localhost:${process.env.PORT}/orders/${result._id}`
                }
            });
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        });
}

exports.orders_delete = (req, res, next) => {
    const id = req.params.orderId
    Order.remove({
        _id: id
    })
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Successful deletion of order with ID: ' + id,
                request: {
                    type: 'GET',
                    url: `http://localhost:${process.env.PORT}/orders/`
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