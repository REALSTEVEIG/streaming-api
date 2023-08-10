class CartService {
  constructor({ cartRepo, cartItemRepo, httpHandler, helpers, path, uuid, config }) {
    this.httpHandler = httpHandler;
    this.cartRepo = cartRepo;
    this.cartItemRepo = cartItemRepo;
    this.helpers = helpers;
    this.path = path;
    this.uuid = uuid;
    this.config = config;
  }

  async create(data) {
    const authorizedUser = data.authorizedUser;
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
      let existingCart = await this.cartRepo.getAll({
        query: { $and: [{ user_id: this.config.id(authorizedUser.user_id) }, { status: "Active" }] },
      });

      //If you already have an open cart
      if (existingCart?.data?.length && existingCart?.data[0]) {

        existingCart = existingCart.data[0];

        let existingItems = await this.cartItemRepo.getAllAggregated([
          {
            $match: {
              cart_id: existingCart?._id,
            },
          },
        ]);

        //If the cart is not empty
        if (existingItems.success && existingItems?.data) {
          let items = existingItems?.data;
          //If the item already in the cart is a partnership
          if (data?.items[0]?.partnership) {
            let partnership = data?.items[0]?.partnership;
            let item = items.find((item) => item?.partnership_id?.toString() == partnership?._id);
            if (item) {
              await this.cartItemRepo.update({
                id: item?._id,
                data: {
                  quantity:
                    data?.items[0]?.quantity && !isNaN(data?.items[0]?.quantity)
                      ? Number(data?.items[0]?.quantity) + Number(item.quantity)
                      : item.quantity,
                },
              });
              return await this.get(existingCart?._id);
            }
          }
          //If the item already in cart contains a giving then just increase the amount

          let item = items.find((item) => !item?.partnership_id);
          if (item && !data?.items[0]?.partnership) {
            let result = await this.cartItemRepo.update({
              id: item?._id,
              data: {
                amount: data?.items[0]?.amount && !isNaN(data?.items[0]?.amount) ? Number(data?.items[0]?.amount) + Number(item.amount) : item.amount,
              },
            });
            if (result.success) {
              return await this.get(existingCart?._id);
            }
          }
        }

        let item = data?.items[0];

        console.log("item3 : ", item)

        await this.cartItemRepo.create({
          cart_id: existingCart._id,
          partnership_id: item?.partnership ? this.config.id(item?.partnership._id) : null,
          quantity: !isNaN(item?.quantity) ? Number(item?.quantity < 1 ? 0 : item?.quantity) : 0,
          amount: !isNaN(item?.amount) ? Number(item?.amount < 1 ? 1 : item?.amount) : 0,
          status: "Active",
          created_at_timestamp: Date.now(),
          modified_at_timestamp: null,
          created_by: authorizedUser.user_id,
          modified_by: null,
        });
        return await this.get(existingCart?._id);
      }

      if (!data?.items || !data?.items?.length) {
        return {
          success: false,
          message: "No items selected to add to cart.",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }

      let result = await this.cartRepo.create({
        user_id: this.config.id(authorizedUser.user_id),
        status: "Active",
        total: 0,
        created_at_timestamp: Date.now(),
        modified_at_timestamp: null,
        created_by: this.config.id(authorizedUser.user_id),
        modified_by: null,
      });

      if (result.success) {
        for (let item of data.items) {
          await this.cartItemRepo.create({
            cart_id: this.config.id(result?.data?.cart_id),
            partnership_id: item.partnership ? this.config.id(item?.partnership._id) : null,
            quantity: !isNaN(item.quantity) ? Number(item.quantity < 1 ? 1 : item.quantity) : 1,
            amount: !isNaN(item.amount) ? Number(item.amount < 1 ? 1 : item.amount) : 0,
            status: "Active",
            created_at_timestamp: Date.now(),
            modified_at_timestamp: null,
            created_by: authorizedUser.user_id,
            modified_by: null,
          });
        }
        return await this.get(result?.data?.cart_id);
      }
      return await this.get(data?._id);
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
    return await this.cartRepo.getAggregated([
      {
        $match: { _id: this.config.id(id) },
      },
      {
        $lookup: {
          from: "cart_items",
          localField: "_id",
          foreignField: "cart_id",
          pipeline: [
            {
              $lookup: {
                from: "ktn_partnerships",
                localField: "partnership_id",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      name: 1,
                      description: 1,
                      amount: 1,
                      color: 1,
                      status: 1,
                      frequency: 1,
                      title: 1,
                      image_url: 1,
                    },
                  },
                ],
                as: "partnership",
              },
            },
            {
              $addFields: {
                partnership: { $arrayElemAt: ["$partnership", 0] },
              },
            },
            {
              $project: {
                cart_id: 1,
                partnership_id: 1,
                status: 1,
                partnership: 1,
                amount: 1,
                quantity: 1,
              },
            },
          ],
          as: "items",
        },
      },
      {
        $project: {
          user_id: 1,
          status: 1,
          total: 1,
          items: 1,
        },
      },
    ]);
  }

  async update(data) {
    const authorizedUser = data.authorizedUser;
    if (!authorizedUser && authorizedUser.isAdmin) {
      return {
        success: false,
        message: "Unauthorized access.",
        status: this.httpHandler.ERROR_201,
        stack: null,
        data: null,
      };
    }

    try {
      if (!data.cart_id) {
        return {
          success: false,
          message: "Records not found",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }
      let cart = await this.cartRepo.get({
        id: data.cart_id,
      });

      if (!cart || !cart?.data) {
        return cart;
      }
      cart = cart?.data;

      let result = await this.cartRepo.update({
        id: data.cart_id,
        data: {
          status: data.status ?? cart.status,
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

  async getAll({ user_id, cart_id, size, page, limit }) {
    try {
      let prepQuery = null;
      if (cart_id) {
        prepQuery = { cart_id: this.config.id(cart_id) };
      }

      if (user_id) {
        prepQuery = { user_id: this.config.id(user_id) };
      }

      let result = await this.cartRepo.getAllAggregated([
        {
          $match: prepQuery ? prepQuery : {},
        },
        {
          $skip: (size && page) ? (parseInt(page) * parseInt(size)) : 0,
        },
        {
          $limit: limit ? parseInt(limit) : 20,
        },
        {
          $lookup: {
            from: "cart_items",
            localField: "_id",
            foreignField: "cart_id",
            pipeline: [
              {
                $lookup: {
                  from: "ktn_partnerships",
                  localField: "partnership_id",
                  foreignField: "_id",
                  pipeline: [
                    {
                      $project: {
                        name: 1,
                        description: 1,
                        amount: 1,
                        color: 1,
                        status: 1,
                        frequency: 1,
                        title: 1,
                        image_url: 1,
                      },
                    },
                  ],
                  as: "partnership",
                },
              },
              {
                $addFields: {
                  partnership: { $arrayElemAt: ["$partnership", 0] },
                },
              },
              {
                $project: {
                  cart_id: 1,
                  partnership_id: 1,
                  status: 1,
                  partnership: 1,
                  amount: 1,
                  quantity: 1,
                },
              },
            ],
            as: "items",
          },
        },
      ]);

      return {
        success: true,
        message: "Success",
        status: this.httpHandler.HANDLED,
        stack: null,
        data: result?.data,
      };
    } catch (error) {
      console.log("Error Getting Cart Records :>>>>>>>>>>>>>>>>", error);
      return {
        success: false,
        message: "Internal server error",
        status: this.httpHandler.ERROR_500,
        stack: error,
        data: null,
      };
    }
  }

  async getUserActiveCart({ user_id }) {
    try {
      let result = await this.cartRepo.getAllAggregated([
        {
          $match: { $and: [{ user_id: this.config.id(user_id) }, { status: "Active" }] },
        },
        {
          $lookup: {
            from: "cart_items",
            localField: "_id",
            foreignField: "cart_id",
            pipeline: [
              {
                $lookup: {
                  from: "ktn_partnerships",
                  localField: "partnership_id",
                  foreignField: "_id",
                  pipeline: [
                    {
                      $project: {
                        name: 1,
                        description: 1,
                        amount: 1,
                        color: 1,
                        status: 1,
                        frequency: 1,
                        title: 1,
                        image_url: 1,
                      },
                    },
                  ],
                  as: "partnership",
                },
              },
              {
                $addFields: {
                  partnership: { $arrayElemAt: ["$partnership", 0] },
                },
              },
              {
                $project: {
                  cart_id: 1,
                  partnership_id: 1,
                  status: 1,
                  partnership: 1,
                  amount: 1,
                  quantity: 1,
                },
              },
            ],
            as: "items",
          },
        },
      ]);

      return {
        success: true,
        message: "Success",
        status: this.httpHandler.HANDLED,
        stack: null,
        data: result?.data,
      };
    } catch (error) {
      console.log("Error getting active cart:>>>>>>>>>>>>>>", error);
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
    if (!authorizedUser || !authorizedUser.isAdmin) {
      return {
        success: false,
        message: "Unauthorized access.",
        status: this.httpHandler.ERROR_401,
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
      let result = await this.cartRepo.delete(id);
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
    if (!authorizedUser || !authorizedUser.isAdmin) {
      return {
        success: false,
        message: "Unauthorized access.",
        status: this.httpHandler.ERROR_401,
        stack: null,
        data: null,
      };
    }
    try {
      let result = await this.cartRepo.deleteAll();
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

module.exports = CartService;
