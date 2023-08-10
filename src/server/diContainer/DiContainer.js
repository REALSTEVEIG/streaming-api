const awilix = require("awilix");
const { config, client } = require("../../database/config/config");
const tokenValidator = require("../auth/tokenValidator");
const { PAGES, USER_STATUS, SETTINGS_CATEGORIES } = require("../helpers/constants");
const Helpers = require("../helpers/helpers.js");
const httpHandler = require("../helpers/httpHandlers");
const HttpHelpers = require("../helpers/httpHelpers");
const HandleResponse = require("../helpers/httpResponse");
const EmailTemplates = require("../helpers/emailTemplates");
const fetch = require("node-fetch");
const crypto = require("crypto");
const uuid = require("uuid");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const nodemailer = require('nodemailer');
const AWS = require("@aws-sdk/client-s3");

const Services = require("../../services/index");
const Controllers = require("../../controllers/index");
const Repositories = require("../../database/repositories/index");

const s3Options = new AWS.S3({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const container = awilix.createContainer({
  injectionMode: awilix.InjectionMode.PROXY,
});

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'thurvpn@gmail.com',
      pass: 'cyosonkokxnuozvh',
  }
});

function setup() {
  container.register({
    ...Services(),
    ...Controllers(),
    ...Repositories(),

    responseHandler: awilix.asClass(HandleResponse),
    httpHelper: awilix.asClass(HttpHelpers),
    httpHandler: awilix.asValue(httpHandler),
    config: awilix.asValue(config),
    client: awilix.asValue(client),
    auth: awilix.asClass(tokenValidator),
    helpers: awilix.asClass(Helpers),
    fetch: awilix.asValue(fetch),
    crypto: awilix.asValue(crypto),
    userStatus: awilix.asValue(USER_STATUS),
    path: awilix.asValue(path),
    uuid: awilix.asValue(uuid),
    fs: awilix.asValue(fs),
    categories: awilix.asValue(SETTINGS_CATEGORIES),
    pages: awilix.asValue(PAGES),
    genSaltSync: awilix.asValue(genSaltSync),
    compareSync: awilix.asValue(compareSync),
    hashSync: awilix.asValue(hashSync),
    jwt: awilix.asValue(jwt),
    s3Options: awilix.asValue(s3Options),
    emailTransporter: awilix.asValue(transporter),
    emailTemplates: awilix.asClass(EmailTemplates)
  });
}

module.exports = { container, setup };
