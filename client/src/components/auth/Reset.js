import React, { Component } from 'react'
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { resetPassword } from '../../actions/authActions';
import TextFieldGroup from '../common/TextFieldGroup';

class Reset extends Component {

  constructor() {
    super();

    this.state = {
      password: '',
      password2: '',
      errors: {},
      success: {}
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errors) {
      this.setState({ errors: nextProps.errors });
    }

    if (nextProps.success) {
      this.setState({ success: nextProps.success })
    }
  }

  onSubmit(e) {
    e.preventDefault();

    const userPass = {
      password: this.state.password,
      password2: this.state.password2
    }
    this.props.resetPassword(this.props.match.params.token, userPass);
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  render() {

    const { errors } = this.state;

    return (
      <div className="container">
        <div className="row">
          <div className="col-md-8 m-auto">
            <h1 className="text-center mb-4">Reset Password</h1>
            <p className="lead text-center">Enter your email to receive password reset link</p>
            <form onSubmit={this.onSubmit}>

              <TextFieldGroup
                placeholder="Enter password"
                name="password"
                type="password"
                value={this.state.password}
                onChange={this.onChange}
                error={errors.password}
              />

              <TextFieldGroup
                placeholder="Confirm Password"
                name="password2"
                type="password"
                value={this.state.password2}
                onChange={this.onChange}
                error={errors.password2}
              />

              <input type="submit" value="Create Password" className="btn btn-info btn-block mt-4" />
              <br />
              {errors.success && <div className="text-success">{errors.success}</div>}
            </form>
          </div>
        </div>
      </div>
    )
  }
}

Reset.propTypes = {
  resetPassword: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
}

const mapStateToProps = state => ({
  errors: state.errors,
  success: state.success
})

export default connect(mapStateToProps, { resetPassword })(Reset);
