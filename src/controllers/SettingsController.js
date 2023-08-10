class SettingsController {
  constructor({ settingsService, responseHandler }) {
    this.service = settingsService;
    this.responseHandler = responseHandler;
  }

  async create(req, res) {
    let body = req.body;
    body.image = req.files.image;
    body.authorizedUser = req.authorizedUser;
    let result = await this.service.create(body);
    return this.responseHandler.handle(res, result);
  }

  async get(req, res) {
    let query = req.params;
    let id = query.id;
    let result = await this.service.get({ id });
    return this.responseHandler.handle(res, result);
  }

  async getActiveBanner(req, res) {
    let query = req.params;
    let section = query.section;
    return this.responseHandler.handle(res, await this.service.getActiveBanner(section));
  }

  async getAll(req, res) {
    const params = req.query;
    const result = await this.service.getAll(params);
    return this.responseHandler.handle(res, result);
  }

  async update(req, res) {
    let body = req.body;
    let query = req.query;
    let params = req.params;
    body.authorizedUser = req.authorizedUser;
    let result = null;
    if (query.status && query.status == "activate") result = await this.service.activateBanner(body, params.id);
    if (query.status && query.status == "deactivate") result = await this.service.deactivateBanner(body, params.id);

    if (!query.status) result = await this.service.update(body);
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

module.exports = SettingsController;
