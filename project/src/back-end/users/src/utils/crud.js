const bcrypt = require('bcryptjs')
const tku = require('./en-de-coders')

var users = {}

function equalPassws (usrPass, usrDbPass) {
  return bcrypt.compareSync(usrPass, usrDbPass)
}

function createUser (usrName, passw) {
  return new Promise((resolve, reject) => {
    if (!users[usrName]) {
      users[usrName] = {
        hashedPassw: bcrypt.hashSync(passw, bcrypt.genSaltSync())
      }
      resolve(tku.encodeToken(usrName))
    } else {
      reject(new Error(`User (${usrName}) already exist.`))
    }
  })
}

function getUser (usrName, passw) {
  return new Promise((resolve, reject) => {
    if (users[usrName]) {
      if (!equalPassws(passw, users[usrName].hashedPassw)) {
        reject(new Error(`User (${usrName}) password does not match`))
      }
      resolve(tku.encodeToken(usrName))
    } else {
      reject(new Error(`User (${usrName}) does not exist`))
    }
  })
}

module.exports = {
  createUser,
  getUser
}
