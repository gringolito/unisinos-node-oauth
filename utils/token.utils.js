var jwt = require('jsonwebtoken');
var config = require('../config');

var createToken = function(auth) {
    return jwt.sign({ id: auth.id }, config.jwtSecret, { expiresIn: 60 * 120 });
};

var validateToken = function(token) {
    return jwt.verify(token, config.jwtSecret);
}

module.exports = {
  generateToken: function(req, res, next) {
      req.token = createToken(req.auth);
      return next();
  },

  sendToken: function(req, res) {
      res.setHeader('x-auth-token', req.token);
      return res.status(200).send(JSON.stringify(req.user));
  },

  decodeToken: function(req, res, next) {
      userToken = req.get('x-auth-token');
      if (userToken) {
        req.user = { token: validateToken(userToken) };
      }
      return next();
  }
};