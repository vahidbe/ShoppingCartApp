const moment = require('moment')
const jwt = require('jwt-simple')

function decodeToken (token) {
  return jwt.decode(token, process.env.TOKEN_SECRET)
}

module.exports = {
  decodeToken
}
