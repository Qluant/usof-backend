const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const appConfig = require('../../config/app.config');

function generateJwtToken(payload) {
  return jwt.sign(payload, appConfig.jwtSecret, {
    expiresIn: appConfig.jwtExpiresIn
  });
}

function verifyJwtToken(token) {
  return jwt.verify(token, appConfig.jwtSecret);
}

function generateRandomToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  generateJwtToken,
  verifyJwtToken,
  generateRandomToken
};
