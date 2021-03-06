'use strict';

require('./mongoose')();
var HealthProgram = require('mongoose').model('HealthProgram');
var User = require('mongoose').model('User');

module.exports = {
    validateUser: function(req, res, next) {
        if (!req.user) {
            return res.status(401).send('User Not Authenticated');
        }

        if (req.params['0'] != req.user.token.id) {
            return res.status(403).send('Access denied');
        }

        return next();
    },

    getAll: function(userId, callback) {
        User.findById(userId, function (err, user) {
            if (user) {
                HealthProgram.findAllPrograms(user.email, function (error, programs) {
                    var userPrograms = [{}];
                    for (var i = 0; i < programs.length; i++) {
                        const date = new Date(programs[i].healthProgram.subscriptionDate);
                        userPrograms[i] = {
                            name: programs[i].healthProgram.name,
                            subscriptionDate: date.toDateString()
                        };
                    }
                    return callback(error, userPrograms);
                });
            } else {
                return callback(err, null);
            }
        });
    },

    subscribe: function(userId, programName, callback) {
        User.findById(userId, function (err, user) {
            if (user) {
                HealthProgram.subscribe(user.email, programName, function (error, program) {
                    return callback(error, program);
                });
            } else {
                return callback(err, null);
            }
        });
    },

    unsubscribe: function(userId, programName, callback) {
        User.findById(userId, function (err, user) {
            if (user) {
                HealthProgram.unsubscribe(user.email, programName, function (error) {
                    return callback(error);
                });
            } else {
                return callback(err);
            }
        });
    }
};