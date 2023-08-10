class PostsController {
  constructor({ ktnPostsService, streamCredentialService, responseHandler }) {
    this.service = ktnPostsService;
    this.streamCredentialService = streamCredentialService;
    this.responseHandler = responseHandler;
  }

  async create(req, res) {
    let body = req.body;
    body.primary_image = req?.files?.primary_image;
    body.secondary_image = req?.files?.secondary_image;
    body.tertiary_image = req?.files?.tertiary_image;
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

  async getPostsByCategory(req, res) {
    const params = req.query;
    if (params.videos) return this.responseHandler.handle(res, await this.streamCredentialService.getVideos(params));
    if (params.upcoming) return this.responseHandler.handle(res, await this.service.getUpcomingEvents(params));
    if (params.latest) return this.responseHandler.handle(res, await this.service.getLatestEvents(params));
    if (params.live && params.active) return this.responseHandler.handle(res, await this.streamCredentialService.getActiveLiveEvent(params));
    if (params.live) return this.responseHandler.handle(res, await this.streamCredentialService.getLiveEvents(params));
    return this.responseHandler.handle(res, await this.service.getPostsByCategory(params));
  }

  async update(req, res) {
    let body = req.body;
    body.primary_image = req?.files?.primary_image;
    body.secondary_image = req?.files?.secondary_image;
    body.tertiary_image = req?.files?.tertiary_image;
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

module.exports = PostsController;
