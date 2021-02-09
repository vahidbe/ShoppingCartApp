import axios from 'axios'

const url = process.env.REACT_APP_AUTH_SERVICE_URL

// The AuthenticationService interface regroups all calls to the Authentification microservice in the back-end
// that could be done from the front-end
class AuthenticationService {
    // setters
    setHandlers(onSucc, setAuthStatus, changeRoute) {
        this.onSucc = onSucc
        this.setAuthStatus = setAuthStatus
        this.changeRoute = changeRoute
    }

    // POST /user
    // ${data} is a JSON object with the fields
    // username=[string] and [password]. These fields
    // matches the specification of the POST call
    registerUser(data, onErr) {
        axios.post(`${url}/user`, data) // Perform an HTTP POST rquest to a url with the provided data.
            .then((res) => {
                // we keep the authentication token
                window.localStorage.setItem('authToken', res.data.token)
                window.localStorage.setItem('username', data.username)
                window.localStorage.setItem('role', data.role)
                this.setAuthStatus(true)
                this.onSucc(`Successful registration of user [${data.username}]!`)
                this.changeRoute('/')
            })
            .catch((error) => {
                console.error("Message: " + error.message)
                var msg = `Registration of user [${data.username}] failed.`
                onErr(`${msg} Error: ${error.message}`)
            })
    }
    // GET /user/:username/:password
    loginUser(data, onErr) {
        axios.get(`${url}/user/${data.username}/${data.password}`) // Perform an HTTP GET rquest to a url.
            .then((res) => {
                window.localStorage.setItem('authToken', res.data.payload.token)
                window.localStorage.setItem('username', data.username)
                window.localStorage.setItem('role', res.data.payload.role)
                this.setAuthStatus(true)
                this.onSucc(`Welcome back [${data.username}]!`)
                this.changeRoute('/')
            })
            .catch((error) => {
                console.error(error.message)
                onErr(`User [${data.username}] is not registered or his credentials are incorrect.`)
            })
    }
}

export default AuthenticationService