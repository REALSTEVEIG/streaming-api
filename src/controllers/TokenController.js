class TokenController {
  constructor({ tokenService, responseHandler }) {
    this.service = tokenService;
    this.responseHandler = responseHandler;
  }

  async create(req, res) {
    let body = req.body;
    body.authorizedUser = req.authorizedUser;
    let result = await this.service.sendOTP(body);
    return this.responseHandler.handle(res, result);
  }

  async sendOTP(req, res) {
    let body = req.body;
    let result = await this.service.sendOTP(body);
    return this.responseHandler.handle(res, result);
  }

  async confirmOTP(req, res) {
    let body = req.body;
    let result = await this.service.confirmOTP(body);
    return this.responseHandler.handle(res, result);
  }

  async get(req, res) {
    let id = req.params.id;
    let result = await this.service.get(id);
    return this.responseHandler.handle(res, result);
  }

  async getAll(req, res) {
    const params = req.query;
    params.authorizedUser = req.authorizedUser;
    const result = await this.service.getAll(params);
    return this.responseHandler.handle(res, result);
  }

  async update(req, res) {
    let body = req.body;
    body.authorizedUser = req.authorizedUser;
    let result = await this.service.update(body);
    return this.responseHandler.handle(res, result);
  }

  async delete(req, res) {
    let id = req.params.id;
    let result = await this.service.delete(id);
    return this.responseHandler.handle(res, result);
  }

  async deleteAll(req, res) {
    let result = await this.service.deleteAll();
    return this.responseHandler.handle(res, result);
  }
}

module.exports = TokenController;
