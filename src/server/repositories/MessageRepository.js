import * as Yup from 'yup';

import { UserInputError } from '../errors';
import loadConnection from '../utils/loadConnection';
import validateWithSchema from '../utils/validateWithSchema';

const messageSchema = Yup.object().shape({
  recipientId: Yup.string().required(),
  body: Yup.string()
    .trim()
    .required()
    .min(1)
    .max(280),
});

const MessageRepository = {
  async getById(context, id) {
    const { currentUser } = context;
    if (!currentUser.isAuthenticated) {
      return null;
    }

    const messageData = await context.sql.loadById('messages', id);
    if (
      !(
        messageData.senderId === currentUser.id ||
        messageData.recipientId === currentUser.id
      )
    ) {
      return null;
    }

    return messageData;
  },

  async loadMessages(context, args) {
    const { currentUser } = context;
    if (!currentUser.isAuthenticated) {
      return null;
    }

    const rawMessages = await context.sql.loadConnection('messages', {
      ...args,
      filter: builder =>
        builder.where({ senderId: currentUser.id }).orWhere({
          recipientId: currentUser.id,
        }),
    });
    return loadConnection(context, MessageRepository.getById, rawMessages);
  },

  async create(context, data) {
    const { currentUser } = context;
    currentUser.requireAuthenticated();

    const validatedData = await validateWithSchema(messageSchema, data);

    // don't allow to send message to yourself
    if (validatedData.recipientId === currentUser.id) {
      throw new UserInputError('Cannot send a message to yourself');
    }

    const newMessageData = {
      ...validatedData,
      senderId: currentUser.id,
    };

    const { id } = await context.sql.insert('messages', newMessageData);
    const message = await MessageRepository.getById(context, id);
    context.pubsub.publish(
      getMessageReceivedTopic(newMessageData.recipientId),
      // TODO: just publish the message and add the prefix in the resolver
      // (requires async iterators support)
      message
    );
    return message;
  },

  listenForReceived(context) {
    const { currentUser, pubsub } = context;
    currentUser.requireAuthenticated();

    return pubsub.asyncIterator(getMessageReceivedTopic(currentUser.id));
  },
};

function getMessageReceivedTopic(recipientId) {
  return `MESSAGE_RECEIVED:${recipientId}`;
}

export default MessageRepository;
