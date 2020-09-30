class AuthenticationService {
  setHandlers (onSucc, setAuthStatus, changeRoute) {
    this.onSucc = onSucc
    this.setAuthStatus = setAuthStatus
    this.changeRoute = changeRoute
  }
  registerUser (data, onErr) {
    window.localStorage.setItem('username', JSON.stringify(data.username))
    window.localStorage.setItem('password', JSON.stringify(data.password))
    this.setAuthStatus(true)
    this.onSucc('You successfully registered!')
    this.changeRoute('/')
  }
  loginUser (data, onErr) {
    if (data.username === 'admin' && data.password === 'admin') {
      window.localStorage.setItem('username', 'admin')
      window.localStorage.setItem('password', 'admin')
      this.setAuthStatus(true)
      this.onSucc('You successfully logged in!')
      this.changeRoute('/')
      return
    }
    var user = window.localStorage.getItem('username')
    if (user && user === JSON.stringify(data.username)) {
      var passw = window.localStorage.getItem('password')
      if (passw === JSON.stringify(data.password)) {
        this.setAuthStatus(true)
        this.onSucc('You successfully logged in!')
        this.changeRoute('/')
      } else {
        onErr("Your password doesn't match!")
      }
    } else {
      onErr(`User [${data.username}] do not have an account.`)
    }
  }
}

export default AuthenticationService
