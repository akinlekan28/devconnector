import React, { Component } from 'react'
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { sendResetLink } from '../../actions/authActions';
import TextFieldGroup from '../common/TextFieldGroup';

class Forgot extends Component {

  constructor() {
    super();

    this.state = {
      email: '',
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

    const userEmail = {
      email: this.state.email,
    }
    this.props.sendResetLink(userEmail);
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
            <h1 className="text-center mb-4">Forgot Password</h1>
            <p className="lead text-center">Enter your email to receive password reset link</p>
            <form onSubmit={this.onSubmit}>
              <TextFieldGroup
                placeholder="Email Address"
                name="email"
                type="email"
                value={this.state.email}
                onChange={this.onChange}
                error={errors.email}
              />

              <input type="submit" value="Get reset link" className="btn btn-info btn-block mt-4" />
              <br />
              {errors.success && <div className="text-success">{errors.success}</div>}
            </form>
          </div>
        </div>
      </div>
    )
  }
}

Forgot.propTypes = {
  sendResetLink: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
}

const mapStateToProps = state => ({
  errors: state.errors,
  success: state.success
})

export default connect(mapStateToProps, { sendResetLink })(Forgot);
