class StreamCredentialsController {
  constructor({ streamCredentialService, responseHandler }) {
    this.service = streamCredentialService;
    this.responseHandler = responseHandler;
  }

  async create(req, res) {
    let body = req.body;
    body.primary_postal = req.files?.primary_postal;
    body.secondary_postal = req.files?.secondary_postal;
    body.tertiary_postal = req.files?.tertiary_postal;
    body.authorizedUser = req.authorizedUser;
    let result = await this.service.create(body);
    return this.responseHandler.handle(res, result);
  }

  async get(req, res) {
    let id = req.params.id;
    let result = await this.service.get(id);
    return this.responseHandler.handle(res, result);
  }

  async getAll(req, res) {
    const params = req.query;
    const result = await this.service.getAll(params);
    return this.responseHandler.handle(res, result);
  }

  async update(req, res) {
    let body = req.body;
    body.primary_postal = req.files?.primary_postal;
    body.secondary_postal = req.files?.secondary_postal;
    body.tertiary_postal = req.files?.tertiary_postal;
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

module.exports = StreamCredentialsController;
