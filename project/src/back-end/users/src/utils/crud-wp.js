const bcrypt = require('bcryptjs')
const tku = require('./en-de-coders')

var users = require('nano')(process.env.DB_URL)

// Checks if the given passwords are the same
function equalPassws (usrPass, usrDbPass) {
  return bcrypt.compareSync(usrPass, usrDbPass)
}

// Creates a user in the database (with username "usrName", role "role" and password "passw")
function createUser (usrName, role, passw) {
  return new Promise((resolve, reject) => {
    users.insert(
      // 1st argument of nano.insert()
      { 'passw': bcrypt.hashSync(passw, bcrypt.genSaltSync()),
        'role': role
      },
      usrName, // 2nd argument of nano.insert()
      // callback to execute once the request to the DB is complete
      (error, success) => {
        if (success) {
          resolve(tku.encodeToken(usrName, role))
        } else {
          reject(
            new Error(`In the creation of user (${usrName}). Reason: ${error.reason}.`)
          )
        }
      }
    )
  })
}

// Returns a token if the user identified by "usrName" exists in the database
// and if its password "passw" matches the password in the database
function getUser (usrName, passw) {
  return new Promise((resolve, reject) => {
    users.get(usrName, (error, success) => {
      if (success) {
        if (!equalPassws(passw, success.passw)) {
          reject(new Error(`Passwords (for user: ${usrName}) do not match.`))
        }
        resolve({ token: tku.encodeToken(usrName, success.role), role: success.role })
      } else {
        reject(new Error(`To fetch information of user (${usrName}). Reason: ${error.reason}.`))
      }
    })
  })
}

module.exports = {
  createUser,
  getUser
}
