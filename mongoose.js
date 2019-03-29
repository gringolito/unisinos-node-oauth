'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var db = null;

module.exports = function () {
    if (db) {
        return db;
    }

    db = mongoose.connect('mongodb://localhost:27017/unisinos-auth');

    var UserSchema = new Schema({
        fullName: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        },
        googleProvider: { type: { id: String, token: String }, select: false }
    });

    UserSchema.set('toJSON', { getters: true, virtuals: true });

    UserSchema.statics.upsertGoogleUser = function (accessToken, refreshToken, profile, callback) {
        var That = this;
        return this.findOne({ 'googleProvider.id': profile.id }, function (err, user) {
            // no user was found, lets create a new one
            if (!user) {
                var newUser = new That({
                    fullName: profile.displayName,
                    email: profile.emails[0].value,
                    googleProvider: { id: profile.id, token: accessToken }
                });

                newUser.save(function (error, savedUser) {
                    if (error) {
                        console.log(error);
                    }
                    return callback(error, savedUser);
                });
            } else {
                return callback(err, user);
            }
        });
    }

    mongoose.model('User', UserSchema);

    var HealthProgramSchema = new Schema({
        email: {
            type: String,
            required: true,
            trim: true,
            select: true,
            match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        },
        healthProgram: {
            type: {
                name: {
                    type: String,
                    required: true
                },
                subscriptionDate: {
                    type: Date,
                    required: true,
                }
           }
        }
    });

    HealthProgramSchema.set('toJSON', { getters: true, virtuals: true });

    HealthProgramSchema.statics.subscribe = function (userEmail, programName, callback) {
        var That = this;
        var newProgram = new That({
            email: userEmail,
            healthProgram: { name: programName, subscriptionDate: Date.now() }
        });

        newProgram.save(function (error, savedProgram) {
            if (error) {
                console.log(error);
            }
            return callback(error, savedProgram);
        });
    }

    HealthProgramSchema.statics.unsubscribe = function (userEmail, programName, callback) {
        return this.remove({ 'email': userEmail, 'healthProgram.name': programName },
            function (error) {
                if (error) {
                    console.log(error);
                }
                return callback(error);
            });
    }

    HealthProgramSchema.statics.findAllPrograms = function (userEmail, callback) {
        return this.find({ 'email': userEmail }, function (error, programs) {
            if (error) {
                console.log(error);
            }
            return callback(error, programs);
        });
    }

    mongoose.model('HealthProgram', HealthProgramSchema);

    return db;
}