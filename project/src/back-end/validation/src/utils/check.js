const tku = require('./en-de-coders')
const moment = require('moment')

function checktoken (username, role, token) {
  return new Promise((resolve, reject) => {
    const payload = tku.decodeToken(token)
    if (payload.exp < moment().unix()) {
      reject(new Error(`Token expired`))
    } else if (!(payload.sub === username)) {
      reject(new Error(`Incorrect username`))
    } else if (!(payload.role === role)) {
      reject(new Error(`Incorrect role`))
    } else {
      resolve({})
    }
  })
}

module.exports = {
  checktoken
}
