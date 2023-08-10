class TransactionsController {
  constructor({ transactionsService, stripeService, responseHandler }) {
    this.service = transactionsService;
    this.responseHandler = responseHandler;
    this.stripeService = stripeService;
  }

  async create(req, res) {
    let body = req.body;
    body.authorizedUser = req.authorizedUser;
    let result = await this.service.create(body);
    return this.responseHandler.handle(res, result);
  }

  async createPaymentIntent(req, res) {
    let body = req.body;
    // body.authorizedUser = req.authorizedUser;
    let result = await this.stripeService.createPaymentIntent(body);
    return this.responseHandler.handle(res, result);
  }

  async get(req, res) {
    let id = req.params.id;
    let result = await this.service.get(id);
    return this.responseHandler.handle(res, result);
  }

  async getAll(req, res) {
    const params = req.query;
    const result = await this.service.getAllAggregated(params);
    return this.responseHandler.handle(res, result);
  }
  async getUserPartnershipSubscriptions(req, res) {
    const params = req.params;
    const result = await this.service.getUserPartnershipSubscriptions(params);
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
    let result = await this.service.delete({ id, authorizedUser: req.authorizedUser });
    return this.responseHandler.handle(res, result);
  }

  async deleteAll(req, res) {
    let result = await this.service.deleteAll({ authorizedUser: req.authorizedUser });
    return this.responseHandler.handle(res, result);
  }
}

module.exports = TransactionsController;
