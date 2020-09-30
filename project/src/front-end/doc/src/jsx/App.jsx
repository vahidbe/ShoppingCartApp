import React from 'react'
import PropTypes from 'prop-types'
import AuthenticationService from './interfaces/AuthenticationService'

export const App = () => (<div />)

App.propTypes = {
  /**
  State of component, the values of each key (in this dictionary) have the following semantic:

  @param showRegis,showLogin: let the application know whether to show the log in page or the users registration page.

  @param authenticated: authenticated users may perform purchases when this variable is set to {true}, this action also set both variables {showRegis} and {showLogin}, to {false}.

  @param flashMessages: latest informative message to show at the top of the current page.

  @param authService: object that consumes the REST API of the authentication service. */
  state: PropTypes.shape({
    showRegis: PropTypes.bool,
    authenticated: PropTypes.bool,
    showLogin: PropTypes.bool,
    flashMessages: PropTypes.oneOf([[]]),
    authService: PropTypes.instanceOf(AuthenticationService)
  })
}

App.defaultProps = {
  state: {
    showRegis: false,
    authenticated: false,
    showLogin: false,
    flashMessages: [],
    authService: new AuthenticationService()
  }
}
