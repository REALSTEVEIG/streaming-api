class UserController {
  constructor({ userService, responseHandler }) {
    this.service = userService;
    this.responseHandler = responseHandler;
  }

  async create(req, res) {
    let body = req.body;
    // body.image = req.files?.image;
    let result = await this.service.create(body);
    return this.responseHandler.handle(res, result);
  }
  async createPassword(req, res) {
    let body = req.body;
    body.user_id = req.user_id;
    let result = await this.service.createPassword(body);
    return this.responseHandler.handle(res, result);
  }

  async get(req, res) {
    let id = req.params.id;
    let result = await this.service.get(id);
    return this.responseHandler.handle(res, result);
  }

  async getAuthenticatedUser(req, res) {
    let result = await this.service.getAuthenticatedUser(req.authorizedUser);
    return this.responseHandler.handle(res, result);
  }

  async getAll(req, res) {
    const params = req.query;
    params.authorizedUser = req.authorizedUser;
    const result = await this.service.getAll(params);
    return this.responseHandler.handle(res, result);
  }

  async getUserByEmail(req, res) {
    const params = { query: { email: req.params.email } };
    params.authorizedUser = req.authorizedUser;
    const result = await this.service.getAll(params);
    return this.responseHandler.handle(res, result);
  }

  async update(req, res) {
    console.log("Files :>>>>>>>>>>>", req.files);
    let body = req.body;
    // console.log("body :>>>>>>>>>>>", body);
    body.image = req.files?.image;
    body.authorizedUser = req.authorizedUser;
    let result = await this.service.update(body);
    return this.responseHandler.handle(res, result);
  }

  async blockUser(req, res) {
    let user_id = req.params;
    // console.log("user_id :>>>>>>>>>>>", user_id); 
    let authorizedUser = req.authorizedUser;
    let result = await this.service.blockUser(user_id, authorizedUser);
    return this.responseHandler.handle(res, result);
  }

  async unBlockUser(req, res) {
    let user_id = req.params;
    let authorizedUser = req.authorizedUser;
    let result = await this.service.unBlockUser(user_id, authorizedUser);
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

  async auth(req, res) {
    let body = req.body;
    let result = await this.service.authenticate(body);
    return this.responseHandler.handle(res, result);
  }

  async changePassword(req, res) {
    let body = req.body;
    body.authorizedUser = req.authorizedUser;
    let result = await this.service.changePassword(body);
    return this.responseHandler.handle(res, result);
  }

  async resetPassword(req, res) {
    let body = req.body;
    body.session_token = req.get("authorization").slice(7);
    let result = await this.service.resetPassword(body);
    return this.responseHandler.handle(res, result);
  }

  async confirmPasswordResetOTP(req, res) {
    let body = req.body;
    body.session_token = req.get("authorization");
    let result = await this.service.confirmPasswordResetOTP(body);
    return this.responseHandler.handle(res, result);
  }

  async requestPasswordReset(req, res) {
    let body = req.body;
    let result = await this.service.requestPasswordReset(body);
    return this.responseHandler.handle(res, result);
  }

  async logout(req, res) {
    let body = req.body;
    body.authorizedUser = req.authorizedUser;
    let result = await this.service.logout(body);
    return this.responseHandler.handle(res, result);
  }  
  
}

module.exports = UserController;
