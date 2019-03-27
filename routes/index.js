var express = require('express');
var router = express.Router();
var { generateToken, sendToken, decodeToken } = require('../utils/token.utils');
var passport = require('passport');
var healthPrograms = require('../healthPrograms');
require('../passport')();

router.route('/auth/google')
    .post(passport.authenticate('google-token', { session: false }), function(req, res, next) {
        if (!req.user) {
            return res.status(401).send('User Not Authenticated');
        }

        req.auth = {
            id: req.user.id
        };

        next();
    }, generateToken, sendToken);


router.route('/users/healthPrograms/*')
    .get(decodeToken, healthPrograms.validateUser, function(req, res) {
        healthPrograms.getAll(req.user.token.id, function(err, programs) {
            if (err) {
                return res.status(400).send('Failed request');
            }

            if (!programs) {
                return res.status(204).send('No Health Programs Found');
            } else {
                return res.status(200).send(JSON.stringify(programs));
            }
        });
    })
    .post(decodeToken, healthPrograms.validateUser, function(req, res) {
        console.log(req);
        healthPrograms.subscribe(req.user.token.id, req.program, function(err, program) {
            if (err || !program) {
                return res.status(400).send('Subscription failed');
            }
            return res.status(200).send('Subscription succeded');
        });
    })
    .delete(decodeToken, healthPrograms.validateUser, function(req, res) {
        console.log(req);
        healthPrograms.unsubscribe(req.user.token.id, req.program, function(err, program) {
            if (err || !program) {
                return res.status(400).send('Unsubscription failed');
            }
            return res.status(200).send('Unsubscription succeded');
        });
    });

module.exports = router;