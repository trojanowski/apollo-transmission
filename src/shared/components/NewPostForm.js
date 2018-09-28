import { Field, Form, Formik } from 'formik';
import React from 'react';

import Input from '../components/Input';
import postSchema from '../validation/postSchema';

export default class NewPostForm extends React.Component {
  render() {
    const { initialValues, onSuccess, savePost } = this.props;
    return (
      <Formik
        initialValues={initialValues}
        validationSchema={postSchema}
        onSubmit={async (values, { setSubmitting }) => {
          let response;
          try {
            response = await savePost(values);
          } finally {
            setSubmitting(false);
          }
          onSuccess(response);
        }}
        render={({ isSubmitting }) => (
          <Form>
            <Field
              component={Input}
              id="new-post-body"
              minRows={3}
              name="body"
              label="Say something"
              type="textarea-autosize"
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
