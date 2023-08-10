class CartItemController {
  constructor({ cartItemService, cartService, responseHandler }) {
    this.service = cartItemService;
    this.cartService = cartService;
    this.responseHandler = responseHandler;
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
    const reqVal = req.headers["authorization"];  
    const base64String = reqVal.split(' ')[1]; // Remove "Bearer " prefix
    const decodedString = Buffer.from(base64String, 'base64').toString('utf-8');
    const decodedObject = JSON.parse(decodedString);
    
    body.authorizedUser = decodedObject;
  
    let result = await this.service.update(body);
    
    return this.responseHandler.handle(res, result);
  }
  

  async delete(req, res) {
    let id = req.params.id;
    let result = await this.service.delete({ id, authorizedUser: req.authorizedUser });
    if (result.success) {
      return this.responseHandler.handle(res, await this.cartService.get(result?.data?.cart_id));
    }
    return this.responseHandler.handle(res, result);
  }

  async deleteAll(req, res) {
    let result = await this.service.deleteAll({ authorizedUser: req.authorizedUser });
    return this.responseHandler.handle(res, result);
  }
}

module.exports = CartItemController;
