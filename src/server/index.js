import http from 'http';

import { ApolloServer } from 'apollo-server-koa';
import Cookies from 'cookies';
import Koa from 'koa';
import KoaRouter from 'koa-router';
import { PubSub } from 'graphql-subscriptions';
import camelcaseKeys from 'camelcase-keys';
import decamelize from 'decamelize';
import { isObjectLike } from 'lodash';
import knexLib from 'knex';
import koaBody from 'koa-bodyparser';
import koaLogger from 'koa-logger';
import koaSession from 'koa-session';

import CurrentUserHelper from './utils/CurrentUserHelper';
import ElasticsearchConnector from './connectors/ElasticsearchConnector';
import UserRepository from './repositories/UserRepository';
import SqlConnector from './connectors/SqlConnector';
import * as authUtils from './utils/auth';
import csrf from './middlewares/csrf';
import createEsClient from './utils/createEsClient';
import isAllowedOrigin from './utils/isAllowedOrigin';
import knexFile from './knexfile';
import schema from './schema';
import serverRender from './handlers/serverRender';
import yupToFormErrors from './utils/yupToFormErrors';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const PORT = 3100;

const app = new Koa();
app.keys = ['some-secret'];

const router = new KoaRouter();

function camelcaseRow(row) {
  if (isObjectLike(row)) {
    return camelcaseKeys(row);
  }
  return row;
}

const esClient = createEsClient();

const knex = knexLib({
  ...knexFile[process.env.NODE_ENV || 'development'],
  asyncStackTraces: !IS_PRODUCTION,
  postProcessResponse(result) {
    if (Array.isArray(result)) {
      return result.map(row => {
        return camelcaseRow(row);
      });
    }
    return camelcaseRow(result);
  },
  wrapIdentifier(value, origImpl) {
    return origImpl(decamelize(value));
  },
});

const pubsub = new PubSub();

async function createGraphqlContext(userId) {
  const sqlConnector = new SqlConnector({ knex });
  let currentUserData;
  if (userId) {
    currentUserData = await sqlConnector.loadById('users', userId);
  }
  const currentUser = new CurrentUserHelper(currentUserData);

  return {
    currentUser,
    esConnector: new ElasticsearchConnector({ client: esClient }),
    clearLoaders() {
      sqlConnector.clearLoaders();
    },
    pubsub,
    sql: sqlConnector,
  };
}

app.use(koaLogger());

app.use(csrf());
app.use(koaBody());
app.use(koaSession({ sameSite: 'lax' }, app));

// add sqlConnector to the Koa context
// (it will be used by graphql and auth middleware)
app.use(async (ctx, next) => {
  const userId = authUtils.getUserId(ctx);
  ctx.graphqlContext = await createGraphqlContext(userId);
  await next();
});

router.post('/auth/signup', async ctx => {
  let newUser;
  try {
    newUser = await UserRepository.create(ctx.graphqlContext, ctx.request.body);
  } catch (error) {
    const validationErrors = yupToFormErrors(error);
    ctx.body = { errors: validationErrors };
    ctx.status = 422;
    return;
  }
  authUtils.login(ctx, newUser);
  ctx.body = { success: true };
});

router.post('/auth/login', async ctx => {
  if (
    !(
      ctx.request.body &&
      ctx.request.body.username &&
      ctx.request.body.password
    )
  ) {
    ctx.throw(400);
  }
  const user = await UserRepository.getByUsernameAndPassword(
    ctx.graphqlContext,
    ctx.request.body.username,
    ctx.request.body.password
  );
  if (!user) {
    ctx.throw(403);
  }
  authUtils.login(ctx, user);
  ctx.body = { success: true };
});

router.post('/auth/logout', ctx => {
  authUtils.logout(ctx);
  ctx.redirect('back');
});

const apolloServer = new ApolloServer({
  schema,
  playground: IS_PRODUCTION
    ? false
    : {
        settings: {
          'request.credentials': 'same-origin',
        },
      },
  context({ connection, ctx }) {
    if (ctx) {
      return ctx.graphqlContext;
    }
    if (connection && connection.context) {
      return connection.context;
    }
    return {};
  },
  subscriptions: {
    async onConnect(connectionParams, webSocket) {
      let userId;

      // CSRF mitigation
      if (!isAllowedOrigin(webSocket.upgradeReq)) {
        throw new Error('Invalid origin');
      }

      const cookies = new Cookies(webSocket.upgradeReq, null, {
        keys: app.keys,
      });
      const sessionCookieRaw = cookies.get('koa:sess', { signed: true });
      if (sessionCookieRaw) {
        let sessionData;
        try {
          sessionData = decodeSessionCookie(sessionCookieRaw);
        } catch (error) {
          // empty
        }

        if (sessionData) {
          if (sessionData._expire && sessionData._expire < Date.now()) {
            // cookie is expired
          } else {
            userId = sessionData.userId;
          }
        }
      }
      return createGraphqlContext(userId);
    },
  },
});
apolloServer.applyMiddleware({ app });

router.get('*', serverRender);

app.use(router.routes());
app.use(router.allowedMethods());

const server = http.createServer(app.callback());
apolloServer.installSubscriptionHandlers(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// based on https://github.com/koajs/session/blob/622a2d803ff0d42ff1620e3c576b089b3725a65f/lib/util.js#L15
function decodeSessionCookie(rawCookie) {
  const body = Buffer.from(rawCookie, 'base64').toString('utf8');
  const json = JSON.parse(body);
  return json;
}
