const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const AppException = require('../exception/app.exception')
const envConfig = require('../config/env.config')
const User = require('../model/user.model')
const { generateUid } = require('../utils/generateUid')
const logger = require('../config/winston.config')
const { createSuccessResponse } = require('../utils/createResponse')

const createToken = (user) => {
  const token = jwt.sign({
    user: {
      id: user.userTag,
      roles: user.roles || [],
      permissions: user.permissions || []
    }
  },
    envConfig.jwt_secret, {
    expiresIn: envConfig.jwt_token_expiry
  })
  return token
}

const registerUser = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const { name, email, password, contact, address } = ctx.request.body;

  const user = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_user_collection)
    .findOne({ email: email });

  if (user) {
    throw new AppException(`User already exists. Email: ${email}`, 'User already exists.', 409)
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = new User(
    name,
    generateUid("uid"),
    email,
    passwordHash,
    contact,
    ['USER'],
    address,
  );

  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_user_collection)
    .insertOne(newUser);

  if (result) {
    ctx.status = 201;
    ctx.body = {
      message: 'User created successfully.',
      user: newUser
    };
    return;
  } else {
    throw new AppException(`User creation failed. Email: ${email}`, 'User creation failed.', 500)
  }

}

const loginUser = async (ctx) => {
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

  const token = createToken(user);
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


const editUser = async (ctx) => {
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


module.exports = { registerUser, loginUser, editUser };