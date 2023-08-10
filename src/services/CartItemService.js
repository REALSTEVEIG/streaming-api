class CartItemService {
  constructor({ cartItemRepo, cartRepo, httpHandler, helpers, path, uuid, config }) {
    this.httpHandler = httpHandler;
    this.cartItemRepo = cartItemRepo;
    this.cartRepo = cartRepo;
    this.helpers = helpers;
    this.path = path;
    this.uuid = uuid;
    this.config = config;
  }

  async get(id) {
    if (!id) {
      return {
        success: false,
        message: "No Record found",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }
    return await this.cartItemRepo.get({
      id,
      values: {
        partnership_id: 1,
        cart_id: 1,
        quantity: 1,
        amount: 1,
        status: 1,
      },
    });
  }


  async update(data) {
    // console.log("Hitt update cart!!!")
    // console.log("fronend-quantity: ", data.quantity)
    // console.log("backend-quantity: ", data.authorizedUser.items.map(e => e.quantity))
    // console.log("cart-id: ",  data.authorizedUser.items.map(e => e.cart_id))
    // console.log("cart-item-id: ",  data.authorizedUser.items.map(e => e._id))

    const authorizedUser = data.authorizedUser;

    try {
      let cart_item = await this.cartItemRepo.get({
        // id: data.cart_item_id,
        id: data.authorizedUser.items.map(e => e._id),
        values: {
          cart_id: 1,
          partnership_id: 1,
          quantity: 2,
          amount: 1,
          status: 1,
        },
      });

      if (!cart_item || !cart_item?.data) {
        return cart_item;
      }
      cart_item = cart_item?.data;

      let result = await this.cartItemRepo.update({
        id: cart_item?._id,
        data: {
          partnership_id: data.partnership_id ? this.config.id(data.partnership_id) : cart_item.partnership_id,
          cart_id: data.cart_id ?? cart_item.cart_id,
          status: data.status ?? cart_item.status,
          quantity: !isNaN(data.quantity) ? Number(data.quantity < 1 ? 0 : data.quantity) : cart_item.quantity,
          amount: !isNaN(data.amount) ? Number(data.amount < 1 ? 1 : data.amount) : cart_item.amount,
          modified_at_timestamp: Date.now(),
          created_by: authorizedUser.user_id,
          modified_by: authorizedUser.user_id,
        },
      });
      return result;
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Internal server error",
        status: this.httpHandler.ERROR_500,
        stack: error,
        data: null,
      };
    }
  }

  async getAll({ query, size, page, limit }) {
    try {
      let result = await this.cartItemRepo.getAll({
        query,
        size,
        page,
        limit,
        values: {
          partnership_id: 1,
          cart_id: 1,
          status: 1,
          quantity: 1,
          amount: 1,
        },
      });

      return {
        success: true,
        message: "Success",
        status: this.httpHandler.HANDLED,
        stack: null,
        data: result?.data,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Internal server error",
        status: this.httpHandler.ERROR_500,
        stack: error,
        data: null,
      };
    }
  }

  async delete({ id, authorizedUser }) {
    if (!authorizedUser || !authorizedUser.user_id) {
      return {
        success: false,
        message: "Unauthorized access.",
        status: this.httpHandler.ERROR_201,
        stack: null,
        data: null,
      };
    }
    if (!id) {
      return {
        success: false,
        message: "No records found",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }
    try {
      let cart = await this.cartItemRepo.get({ id });
      if (!cart && !cart.data) {
        return {
          success: false,
          message: "No records found",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }

      let cart_id = cart?.data?.cart_id;

      let result = await this.cartItemRepo.delete(id);
      result.data = { cart_id: cart_id?.toString() };
      return result;
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Internal server error",
        status: this.httpHandler.ERROR_500,
        stack: error,
        data: null,
      };
    }
  }

  async deleteAll(authorizedUser) {
    if (!authorizedUser) {
      return {
        success: false,
        message: "Unauthorized access.",
        status: this.httpHandler.ERROR_201,
        stack: null,
        data: null,
      };
    }
    try {
      let result = await this.cartItemRepo.deleteAll();
      return result;
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Internal server error",
        status: this.httpHandler.ERROR_500,
        stack: error,
        data: null,
      };
    }
  }
}

module.exports = CartItemService;
