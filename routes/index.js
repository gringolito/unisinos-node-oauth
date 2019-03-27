var express = require('express');
var router = express.Router();
var { generateToken, sendToken } = require('../utils/token.utils');
var passport = require('passport');
var healthPrograms = require('../healthPrograms');
require('../passport')();

router.route('/auth/google')
    .post(passport.authenticate('google-token', { session: false }), function(req, res, next) {
        console.log(req);
        if (!req.user) {
            return res.status(401).send('User Not Authenticated');
        }

        req.auth = {
            id: req.user.id
        };

        next();
    }, generateToken, sendToken);


router.route('/users/healthPrograms/*')
    .get(function(req, res, next) {
        console.log(req);
        if (!req.user) {
            return res.status(401).send('User Not Authenticated');
        }

        healthPrograms.getAll(req.user.email, function(err, programs) {
            if (err) {
                return res.status(400).send('Failed request');
            }

            if (!programs) {
                return res.status(204).send('No Health Programs Found');
            } else {
                return res.status(200).send(JSON.stringify(programs));
            }
        });

        next();
    })
    .post(function(req, res, next) {
        console.log(req);
        if (!req.user) {
            return res.status(401).send('User Not Authenticated');
        }

        healthPrograms.subscribe(req.user.email, req.program, function(err, program) {
            if (err || !program) {
                return res.status(400).send('Subscription failed');
            }
            return res.status(200).send('Subscription succeded');
        });

        next();
    })
    .delete(function(req, res, next) {
        console.log(req);
        if (!req.user) {
            return res.status(401).send('User Not Authenticated');
        }

        healthPrograms.unsubscribe(req.user.email, req.program, function(err, program) {
            if (err || !program) {
                return res.status(400).send('Unsubscription failed');
            }
            return res.status(200).send('Unsubscription succeded');
        });

        next();
    });

module.exports = router;