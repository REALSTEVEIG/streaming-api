const httpHandler = Object.freeze({
  NO_URL_PATH_MATCH: "NO_URL_PATH_MATCH",
  NO_HTTP_METHOD_MATCH: "NO_HTTP_METHOD_MATCH",
  HANDLED: "HANDLED",
  DELETED: "DELETED",
  ERROR_400: "BAD_REQUEST",
  ERROR_401: "UNAUTHORIZED",
  ERROR_500: "INTERNAL_SERVER_ERROR",
  ERROR_204: "NO_CONTENT",
  ERROR_201: "INVALID_LOGIN",
});

module.exports = httpHandler;
