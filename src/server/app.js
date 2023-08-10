require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const routes = require("./routes/index");
const bodyParser = require("body-parser");
const rateLimiter = require("express-rate-limit");
const { setup, container } = require("../server/diContainer/DiContainer");

// Apply the rate limiting middleware to all requests
// const limiter = rateLimiter({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
//   message: "Too many requests, please try again after an hour",
//   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// });

module.exports = () => {
  setup();
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(bodyParser.json());

  // Add log middleware
  app.use(function(req, res, next) {
    console.log("api call!!!!");
    next();
  });

  app.use(
    fileUpload({
      useTempFiles: true,
      tempFileDir: "/tmp/",
    })
  );
  // app.use(limiter);

  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Methods", "DELETE, PUT, GET, POST, PATCH, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
  });
  

  app.use(express.static(path.join(__dirname, "../../public")));

  //Registers all routes
  for (const route of routes(express, container)) {
    app.use("/", route);
  }

  return app;
};
