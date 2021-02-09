const moment = require('moment')
const jwt = require('jwt-simple')

function encodeToken (user, role) {
  var playload = {
    exp: moment().add(14, 'days').unix(),
    iat: moment().unix(),
    sub: user,
    role: role
  }
  return jwt.encode(playload, process.env.TOKEN_SECRET)
}

module.exports = {
  encodeToken
}
