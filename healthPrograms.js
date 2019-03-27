'use strict';

require('./mongoose')();
var HealthProgram = require('mongoose').model('HealthProgram');

module.exports = function getAll(userEmail, callback) {
    HealthProgram.getAll(userEmail, function(err, programs) {
        return callback(err, programs);
    });
};