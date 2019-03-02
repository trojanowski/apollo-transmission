import { Field, Form, Formik } from 'formik';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Mutation } from 'react-apollo';
import React from 'react';
import gql from 'graphql-tag';

import Input from './Input';
import Message from './Message';
import postSchema from '../validation/postSchema';
import { sendMessageUpdater } from '../utils/updaters';

class PrivateMessageDialog extends React.Component {
  state = { messageSent: false };

  handleToggle = () => {
    this.props.toggle();
    if (this.state.messageSent) {
      this.setState({
        messageSent: false,
      });
    }
  };

  renderContent() {
    const { sendMessage, user } = this.props;

    if (this.state.messageSent) {
      return (
        <React.Fragment>
          <ModalBody>
            <p>Message was sent successfully</p>
          </ModalBody>
          <ModalFooter>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={this.handleToggle}
            >
              Close
            </button>
          </ModalFooter>
        </React.Fragment>
      );
    }

    return (
      <Formik
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await sendMessage({ ...values, recipientId: user.id });
            this.setState({ messageSent: true });
          } finally {
            setSubmitting(false);
          }
        }}
        validationSchema={postSchema}
        render={({ isSubmitting }) => (
          <Form>
            <ModalBody>
              <Field
                component={Input}
                id="new-message-body"
                minRows={3}
                name="body"
                label="Write a message"
                type="textarea-autosize"
              />
            </ModalBody>
            <ModalFooter>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={this.handleToggle}
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                disabled={isSubmitting}
                type="submit"
              >
                Submit
              </button>
            </ModalFooter>
          </Form>
        )}
      />
    );
  }

  render() {
    const { isOpen, user } = this.props;

    return (
      <Modal isOpen={isOpen} toggle={this.handleToggle}>
        <ModalHeader toggle={this.handleToggle}>
          Send message to <b>{user.username}</b>
        </ModalHeader>
        {this.renderContent()}
      </Modal>
    );
  }
}

export default class PrivateMessageDialogWithMutation extends React.Component {
  render() {
    return (
      <Mutation
        mutation={gql`
          mutation SendMessageMutation($input: SendMessageInput!) {
            sendMessage(input: $input) {
              ...MessageComponentFragment
            }
          }
          ${Message.fragments.message}
        `}
        update={sendMessageUpdater}
      >
        {sendMessageMutation => (
          <PrivateMessageDialog
            {...this.props}
            sendMessage={input => sendMessageMutation({ variables: { input } })}
          />
        )}
      </Mutation>
    );
  }
}
