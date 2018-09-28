import * as Yup from 'yup';
import bcryptjs from 'bcryptjs';
import gravatarUrl from 'gravatar-url';

import { UserInputError } from '../errors';
import isUsernameReserved from '../../shared/utils/isUsernameReserved';
import userProfileSchema from '../../shared/validation/userProfileSchema';
import validateWithSchema from '../utils/validateWithSchema';

const USERS_TABLE = 'users';

class User {
  constructor(data) {
    Object.assign(this, data);
  }

  avatarUrl({ size }) {
    return gravatarUrl(this.__email, { d: 'identicon', s: size });
  }
}

const UserRepository = {
  async load(context, keyName, keyValue) {
    const userData = await context.sql.load(USERS_TABLE, keyName, keyValue);

    if (!userData) {
      return null;
    }

    // better to use `pick` from lodash with an explicit list of public
    // and private fields
    const filteredData = {
      id: userData.id,
      username: userData.username,
      fullname: userData.fullname,
      bio: userData.bio,
      __email: userData.email,
    };

    if (context.currentUser.id === userData.id) {
      filteredData.email = userData.email;
    }

    return new User(filteredData);
  },

  getById(context, id) {
    return UserRepository.load(context, 'id', id);
  },

  getByUsername(context, username) {
    return UserRepository.load(context, 'username', username);
  },

  async create(context, data) {
    const userSchema = createUserValidationSchema(context);
    const validatedData = await userSchema.validate(data, {
      abortEarly: false,
    });
    const { password, ...rest } = validatedData;
    const salt = await bcryptjs.genSalt();
    const passwordHash = await bcryptjs.hash(password, salt);
    const newUserData = { ...rest, passwordHash };
    const { id } = await context.sql.insert('users', newUserData);
    return UserRepository.getById(context, id);
  },

  async updateProfile(context, input) {
    const { currentUser } = context;
    currentUser.requireAuthenticated();

    const validatedData = await validateWithSchema(userProfileSchema, input);
    await context.sql.update(USERS_TABLE, currentUser.id, validatedData);
    return UserRepository.getById(context, currentUser.id);
  },

  async getByUsernameAndPassword(context, usernameOrEmail, password) {
    if (!(usernameOrEmail && password)) {
      return null;
    }

    const loweredUsernameOrEmail = usernameOrEmail.toLowerCase();

    const isEmail = usernameOrEmail.includes('@');
    const filterField = isEmail ? 'email' : 'username';
    const user = await context.sql.load(
      'users',
      filterField,
      loweredUsernameOrEmail
    );

    if (!user) {
      return null;
    }

    const isPasswordCorrect = await bcryptjs.compare(
      password,
      user.passwordHash
    );
    if (isPasswordCorrect) {
      return UserRepository.getById(context, user.id);
    }

    return null;
  },

  async isFollowing(context, userId) {
    const { currentUser } = context;
    if (currentUser.isAnonymous) {
      return false;
    }

    if (userId === currentUser.id) {
      return true;
    }

    const follow = await context.sql.loadAllWhere('follows', {
      followedId: userId,
      followerId: currentUser.id,
    });
    return follow.length > 0;
  },

  getFollowedQuery(context, userId) {
    return context.sql
      .knex('follows')
      .select('followedId')
      .where({ followerId: userId });
  },

  async follow(context, userId) {
    const { currentUser } = context;
    currentUser.requireAuthenticated();

    if (currentUser.id === userId) {
      throw new UserInputError('You cannot follow yourself');
    }
    const alreadyFollowing = await UserRepository.isFollowing(context, userId);
    if (!alreadyFollowing) {
      await context.sql.insert('follows', {
        followedId: userId,
        followerId: currentUser.id,
      });
    }

    return UserRepository.getById(context, userId);
  },

  async unfollow(context, userId) {
    const { currentUser } = context;
    currentUser.requireAuthenticated();

    await context.sql.deleteWhere('follows', {
      followedId: userId,
      followerId: currentUser.id,
    });

    return UserRepository.getById(context, userId);
  },
};

function createUserValidationSchema(context) {
  return Yup.object().shape({
    username: Yup.string()
      .trim()
      .required()
      // from https://stackoverflow.com/a/1223146/2750114 - but spaces are not allowed
      .matches(
        /^[A-Za-z0-9]+(?:[_-][A-Za-z0-9]+)*$/,
        'Incorrect username format'
      )
      // Convert username to lowercase. In postgres you can alternatively use
      // the `CITEXT` type
      .lowercase()
      .min(2)
      .max(20)
      .test('username-not-reserved', 'Username is reserved', value => {
        return !isUsernameReserved(value);
      })
      .test('username-available', 'Username is not available', value => {
        return context.sql.checkIfNotExists('users', 'username', value);
      }),
    email: Yup.string()
      .trim()
      .required()
      .email()
      // Convert email to lowercase. In postgres you can alternatively use
      // the `CITEXT` type
      .lowercase()
      .max(255)
      .test('email-available', 'Email is not available', value => {
        return context.sql.checkIfNotExists('users', 'email', value);
      }),
    password: Yup.string()
      .required()
      .min(6)
      .max(1000),
  });
}

export default UserRepository;
