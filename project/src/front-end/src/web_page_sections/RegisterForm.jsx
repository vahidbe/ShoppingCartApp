import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'

class RegisterForm extends Component {
  componentWillMount () {
    this.state = {
      errors: {},
      username: '',
      password: '',
      cancel: false
    }
  }
  constructor (props) {
    super(props)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.onCancel = this.onCancel.bind(this)
  }
  handleInputChange (event) {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name
    this.setState({
      [name]: value
    })
  }
  onSubmit (event) {
    event.preventDefault()
    this.props.registerUser(this.state, (errorMessage) => {
      if (errorMessage) {
        this.props.createFlashMessage(errorMessage, 'error')
      }
    })
  }
  onCancel (event) {
    event.preventDefault()
    this.props.setAuthStatus(false, false, false)
    this.setState({ cancel: true })
  }
  render () {
    const { username, password, cancel } = this.state
    return (
      cancel ? <Redirect to='/' /> : <div className='container'>
        <div className='col-md-6'>
          <h1>Register</h1>
          <hr /><br />
          <form
            onSubmit={(event) => {
              this.onSubmit(event)
            }} className='form-horizontal' >
            <div className='form-group'>
              <label htmlFor='username' className='col-md-2 control-label'>
                Username
              </label>
              <div className='col-md-10'>
                <input
                  type='text'
                  className='form-control'
                  id='username'
                  name='username'
                  value={username}
                  onChange={this.handleInputChange} />
              </div>
            </div>
            <div className='form-group'>
              <label htmlFor='password' className='col-md-2 control-label'>
                Password
              </label>
              <div className='col-md-10'>
                <input
                  type='password'
                  className='form-control'
                  id='password'
                  name='password'
                  value={password}
                  onChange={this.handleInputChange} />
              </div>
            </div>
            <div className='form-group'>
              <div className='col-md-offset-2 col-md-10'>
                <button
                  type='submit'
                  className='btn btn-success'
                >Sign up</button>
                &nbsp;
                <button className='btn btn-primary' onClick={this.onCancel}>
                  Cancel
                </button>
                <p>Already registered? <Link to='/login'>Log in</Link></p>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

export default RegisterForm
