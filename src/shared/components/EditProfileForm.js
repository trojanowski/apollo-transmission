import { Field, Form, Formik } from 'formik';
import { NotificationManager } from 'react-notifications';
import React from 'react';

import Input from '../components/Input';
import getValidationErrors from '../utils/getValidationErrors';
import userProfileSchema from '../validation/userProfileSchema';

export default class EditProfileForm extends React.Component {
  render() {
    const { currentUser, updateProfile } = this.props;
    return (
      <Formik
        initialValues={mapUserToFormValues(currentUser)}
        validationSchema={userProfileSchema}
        onSubmit={async (values, { setErrors, setSubmitting, setValues }) => {
          let response;
          try {
            response = await updateProfile(values);
          } catch (error) {
            setErrors(getValidationErrors(error));
            NotificationManager.error('Cannot update profile');
            return;
          } finally {
            setSubmitting(false);
          }

          setValues(mapUserToFormValues(response.data.updateProfile));
          NotificationManager.success('Profile updated');
        }}
        render={({ isSubmitting }) => (
          <Form>
            <Field
              component={Input}
              id="edit-profile-fullname"
              name="fullname"
              label="Full name"
              type="text"
            />
            <Field
              component={Input}
              id="edit-profile-bio"
              name="bio"
              label="Bio"
              type="textarea"
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
    );
  }
}

function mapUserToFormValues(user) {
  return {
    bio: user.bio || '',
    fullname: user.fullname || '',
  };
}
