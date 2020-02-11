const User = require('../models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.users_get_all = (req, res, next) => {
    User
        .find()
        .select('_id email password')
        .then(docs => {
            res.status(200).json({
                userCount: docs.length,
                userList: docs
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        });
}

exports.users_delete = (req, res, next) => {
    User
        .remove({ _id: req.params.userId })
        .exec()
        .then(result => {
            if (result) {
                res.status(200).json({
                    message: 'User Deleted',
                    request: {
                        type: 'GET',
                        url: `http://localhost:${process.env.PORT}/users/`
                    }
                });
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        });
}

exports.users_signup = (req, res, next) => {
    User
        .find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                res.status(409).json({
                    message: 'eMail in use'
                });
            } else {
                bcrypt.hash(req.body.password, 0, (err, hash) => {
                    if (err) {
                        console.log(err)
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                        user.save()
                            .then(result => {
                                res.status(201).json({
                                    message: 'User Created',
                                    request: {
                                        type: 'GET',
                                        url: `http://localhost:${process.env.PORT}/users/`
                                    }
                                });
                            })
                            .catch(err => {
                                console.log(err)
                                res.status(500).json({
                                    error: err
                                })
                            })
                    }
                });
            }
        })
}

exports.users_login = (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Authentication failed'
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    res.status(401).json({
                        message: 'Authentication failed'
                    })
                }
                if (result) {
                    const token = jwt.sign(
                        {
                            email: user[0].email,
                            userId: user[0]._id
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "1h"
                        },
                    );
                    return res.status(200).json({
                        message: 'Authentication success.',
                        token: token
                    }
                    )
                }
                return res.status(401).json({
                    message: 'Authentication failed'
                })
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
}