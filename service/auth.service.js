const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const AppException = require('../exception/app.exception')
const envConfig = require('../config/env.config')
const User = require('../model/user.model')
const { generateUid } = require('../utils/generateUid')
const logger = require('../config/winston.config')
const { createSuccessResponse } = require('../utils/createResponse')
const { insertUser } = require('../mongodb/user.mongo')
const { roles, userRole } = require('../utils/types.enum')
const { fetchChannel, fetchChannels } = require('../mongodb/channel.mongo')

const createToken = (payload, ttl) => {
  const token = jwt.sign(payload,
    envConfig.jwt_secret, {
    expiresIn: ttl
  })
  return token
}

exports.registerRootUser = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const { name, email, password } = ctx.request.body;

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = new User(
    name,
    generateUid("uid_"),
    email,
    passwordHash,
    null,
    roles.R,
    null
  );

  const result = await insertUser(mongoClient, newUser);

  if (!result) {
    throw new AppException('Root user registration failed.', 'Root user registration failed', 500)
  }

  const token = createToken({ id: newUser.userTag }, envConfig.jwt_token_expiry);
  ctx.cookies.set('token', token, {
    maxAge: Math.floor(Date.now() / 1000) + 3600
  });

  ctx.status = 201
  ctx.body = createSuccessResponse(
    ctx.originalUrl,
    ctx.method,
    ctx.status,
    {
      message: 'Root user registered successfully.',
      user: newUser.userTag,
      token: token
    }
  )
}

exports.registerUser = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const { name, email, password, contact, address, token } = ctx.request.body;
  const passwordHash = await bcrypt.hash(password, 10);

  if (token) {
    const decodedToken = jwt.verify(token, envConfig.jwt_secret);
    if (!decodedToken) {
      throw new AppException('Invalid invite token', 'Invalid invite token', 401)
    }
    const newUser = new User(
      name,
      generateUid("uid_"),
      email,
      passwordHash,
      contact,
      decodedToken.role,
      { society: decodedToken.sid, wing: decodedToken.wid },
    );
    const result = await insertUser(mongoClient, newUser);
    if (!result) {
      throw new AppException('User registration failed.', 'User registration failed', 500)
    }

    if (decodedToken.role === roles.S) {
      await mongoClient
        .db(envConfig.mongo_database)
        .collection(envConfig.mongo_channel_collection)
        .updateMany({ $or: [{ channelId: decodedToken.sid }, { society: decodedToken.sid }] }, { $push: { admins: newUser.userTag } });

      logger.info(`User ${newUser.userTag} added to channel ${decodedToken.sid}`)
    }
    else if (decodedToken.role === roles.A) {
      // TODO: Can we combine the below two queries in one 
      // a-> if wid push to admins, else if sid push to members
      await mongoClient
        .db(envConfig.mongo_database)
        .collection(envConfig.mongo_channel_collection)
        .updateOne({ channelId: decodedToken.sid }, { $push: { members: newUser.userTag } });

      await mongoClient
        .db(envConfig.mongo_database)
        .collection(envConfig.mongo_channel_collection)
        .updateOne({ channelId: decodedToken.wid }, { $push: { admins: newUser.userTag } });
    }
    else if (decodedToken.role === roles.U) {
      // u-> sid mei member and wid mei member
      await mongoClient
        .db(envConfig.mongo_database)
        .collection(envConfig.mongo_channel_collection)
        .updateMany({ $or: [{ channelId: decodedToken.sid }, { channelId: decodedToken.wid }] }, { $push: { members: newUser.userTag } });
    }
    // TODO: add invitation to the user who invited this user
    // await addInvitation(mongoClient, {decodedToken.invitedBy, newUser.userTag, decodedToken.role, decodedToken.sid, decodedToken.wid})

    ctx.status = 201
    ctx.body = createSuccessResponse(
      ctx.originalUrl,
      ctx.method,
      ctx.status,
      {
        message: 'User registered successfully.',
        user: newUser.userTag
      }
    )
    return;
  }

  const newUser = new User(
    name,
    generateUid("uid_"),
    email,
    passwordHash,
    contact,
    roles.U,
    address,
  );

  const result = await insertUser(mongoClient, newUser)

  if (!result) {
    throw new AppException('User registration failed.', 'User registration failed', 500)
  }

  ctx.status = 201
  ctx.body = createSuccessResponse(
    ctx.originalUrl,
    ctx.method,
    ctx.status,
    {
      message: 'User registered successfully.',
      user: newUser.userTag
    }
  )
}

exports.loginUser = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const { email, password } = ctx.request.body;
  const user = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_user_collection)
    .findOne({ email: email })
  if (!user) {
    throw new AppException(`User not found. Email: ${email}`, 'User not found', 401)
  }
  if (!user.active) {
    throw new AppException(`User is deactivated. Email: ${user.email}, Active: ${user.active}`, 'User is deactivated.', 403)
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new AppException(`Invalid User Credentials`, 'Invalid User Credentials.', 401)
  }

  const tokenPayload = {
    id: user.userTag,
    // role: user.roles,
    // permissions: user.permissions || null,
    // address: user.address
  }

  const token = createToken(tokenPayload, envConfig.jwt_token_expiry);
  ctx.cookies.set('token', token, {
    maxAge: Math.floor(Date.now() / 1000) + 3600
  });

  ctx.status = 200
  ctx.body = createSuccessResponse(
    ctx.originalUrl,
    ctx.method,
    ctx.status,
    {
      message: 'User logged in successfully.',
      user: user.userTag
    }
  )
  return;
}

exports.editUser = async (ctx) => {
  // allow only edit to user role or active status
  const mongoClient = await ctx.dbClient;
  const userTag = ctx.params.tag;
  const { roles } = ctx.request.body;

  const user = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_user_collection)
    .findOne({ userTag: userTag });

  if (!user) {
    throw new AppException(`User not found. UserTag: ${userTag}`, 'User not found', 404)
  }

  // update user roles array
  await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_user_collection)
    .updateOne({ userTag: userTag }, { $set: { roles: roles } });

  ctx.status = 200;
  ctx.body = {
    message: 'User updated successfully',
    user: userTag
  };
  return;
}

exports.createInviteLink = async (ctx) => {
  const invitePayload = {};

  if (ctx.request.body.role === roles.S) {
    invitePayload.role = roles.S;
    invitePayload.invitedBy = ctx.user.id;
    invitePayload.sid = ctx.request.body.wing;
    invitePayload.wid = null;
  }
  else if (ctx.request.body.role === roles.A) {
    invitePayload.role = roles.A;
    invitePayload.invitedBy = ctx.user.id;
    invitePayload.sid = ctx.user.sid;
    invitePayload.wid = ctx.request.body.wing;
  }
  else if (ctx.request.body.role === roles.U) {
    invitePayload.role = roles.U;
    invitePayload.invitedBy = ctx.user.id;
    invitePayload.sid = ctx.user.sid;
    invitePayload.wid = ctx.request.body.wing;
  }
  const token = createToken(invitePayload, '1h');

  ctx.status = 200;
  ctx.body = {
    message: 'Invite link created successfully',
    token: token
  };
}
