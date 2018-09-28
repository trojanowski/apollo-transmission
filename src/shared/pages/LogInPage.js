import { Field, Form, Formik } from 'formik';
import React from 'react';

import Input from '../components/Input';

const ERROR_MESSAGES = {
  INVALID_LOGIN_DATA: 'Invalid username or password',
  NETWORK_ERROR: 'Network error occurred. Try again.',
};

export default class LogInPage extends React.Component {
  state = {
    errorMessage: null,
  };

  setErrorMessage(errorMessage) {
    this.setState({ errorMessage });
  }

  render() {
    return (
      <div>
        {this.state.errorMessage && (
          <div className="alert alert-danger" role="alert">
            {this.state.errorMessage}
          </div>
        )}
        <Formik
          initialValues={{ username: '', password: '' }}
          onSubmit={async (values, { setSubmitting }) => {
            let response;

            try {
              response = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify(values),
              });
            } catch (error) {
              setSubmitting(false);
              this.setErrorMessage(ERROR_MESSAGES.NETWORK_ERROR);
              return;
            }

            if (response.ok) {
              const redirectedFrom = (this.props.location.state &&
                this.props.location.state.from) || { pathname: '/' };
              window.location.assign(redirectedFrom.pathname);
              return;
            }

            if (response.status === 403) {
              this.setErrorMessage(ERROR_MESSAGES.INVALID_LOGIN_DATA);
            } else {
              this.setErrorMessage(ERROR_MESSAGES.NETWORK_ERROR);
            }
            setSubmitting(false);
          }}
          render={({ isSubmitting }) => (
            <Form>
              <Field
                component={Input}
                id="signin-username"
                name="username"
                label="Username or email"
                required
                type="text"
              />
              <Field
                component={Input}
                id="signin-password"
                name="password"
                label="Password"
                required
                type="password"
              />
              <button
                className="btn btn-primary"
                disabled={isSubmitting}
                type="submit"
              >
                Submit
              </button>
            </Form>
          )}
        />
      </div>
    );
  }
}
