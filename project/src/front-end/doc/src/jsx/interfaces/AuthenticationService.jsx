import React from 'react'
import PropTypes from 'prop-types'

// export const App = () => (<div />)
class AuthenticationService {
  render () {
    return (<div />)
  }
}

AuthenticationService.propTypes = {
  showRegis: PropTypes.bool
}

AuthenticationService.defaultProps = {
  showRegis: false
}

export default AuthenticationService
