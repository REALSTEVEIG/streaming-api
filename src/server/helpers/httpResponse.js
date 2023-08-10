class HandleResponse {
  constructor({ httpHandler, httpHelper }) {
    this.httpHandler = httpHandler;
    this.httpHelper = httpHelper;
  }
  handle(res, data) {
    switch (data.status) {
      case this.httpHandler.HANDLED:
        return this.httpHelper.respondWith200OkJson(res, data);
      case this.httpHandler.DELETED:
        return this.httpHelper.respondWith204NoContent(res, data);
      case this.httpHandler.ERROR_204:
        return this.httpHelper.respondWith200OkJson(res, data);
      case this.httpHandler.ERROR_201:
        return this.httpHelper.respondWith201Created(res, data);
      case this.httpHandler.ERROR_401:
        return this.httpHelper.respondWith401Unauthorized(res, data);
      case this.httpHandler.ERROR_400:
        return this.httpHelper.respondWith400BadRequest(res, data);
      case this.httpHandler.ERROR_500:
        return this.httpHelper.respondWith500InternalServerError(res, data);
      default:
        return this.httpHelper.respondWith204NoContent(res, data);
    }
  }
}
module.exports = HandleResponse;
