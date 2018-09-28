import { Field, Form, Formik } from 'formik';
import React from 'react';

import Input from '../components/Input';

export default class SignUpPage extends React.Component {
  state = {
    networkError: false,
  };

  setNetworkError(wasNetworkError) {
    this.setState({ networkError: wasNetworkError });
  }

  render() {
    return (
      <div>
        {this.state.networkError && (
          <div className="alert alert-danger" role="alert">
            Network error occurred. Try again.
          </div>
        )}
        <Formik
          initialValues={{ username: '', email: '', password: '' }}
          onSubmit={async (values, { setSubmitting, setErrors }) => {
            let response;

            try {
              response = await fetch('/auth/signup', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify(values),
              });
            } catch (error) {
              setSubmitting(false);
              this.setNetworkError(true);
              return;
            }

            if (response.ok) {
              window.location.assign('/');
              return;
            }
            if (response.status === 422) {
              const responseJson = await response.json();
              if (responseJson.errors) {
                setErrors(responseJson.errors);
              }
              this.setNetworkError(false);
            } else {
              setErrors({});
              this.setNetworkError(true);
            }
            setSubmitting(false);
          }}
          render={({ isSubmitting }) => (
            <Form>
              <Field
                component={Input}
                id="signup-username"
                name="username"
                label="Username"
                type="text"
              />
              <Field
                component={Input}
                id="signup-email"
                name="email"
                label="Email"
                type="email"
              />
              <Field
                component={Input}
                id="signup-password"
                name="password"
                label="Password"
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
