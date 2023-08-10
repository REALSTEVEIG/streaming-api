class TransactionsService {
  constructor({ transactionsRepo, cartRepo, ktnPartnershipsRepo, cartItemRepo, httpHandler, helpers, path, uuid, config }) {
    this.httpHandler = httpHandler;
    this.cartRepo = cartRepo;
    this.transactionsRepo = transactionsRepo;
    this.partnershipRepo = ktnPartnershipsRepo;
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
        status: this.httpHandler.ERROR_401,
        stack: null,
        data: null,
      };
    }
    if (!data.cart_id) {
      return {
        success: false,
        message: "Cart not found.",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }

    if (!data.transaction_reference) {
      return {
        success: false,
        message: "Transaction reference not found.",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }
    try {
      let result = await this.transactionsRepo.create({
        user_id: this.config.id(authorizedUser.user_id),
        cart_id: this.config.id(data.cart_id),
        status: data.status,
        transaction_reference: data.transaction_reference,
        amount: data.amount?.toString(),
        narration: data.narration,
        created_at_timestamp: Date.now(),
        modified_at_timestamp: Date.now(),
        created_by: authorizedUser.user_id,
        modified_by: authorizedUser.user_id,
      });

      if (result.success) {
        let cart = await this.cartRepo.getAggregated([
          {
            $match: { _id: this.config.id(data.cart_id) },
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
        await this.cartRepo.update({
          id: data.cart_id,
          data: {
            status: "Paid",
            total: cart?.items?.reduce((accumulator, item) => {
              if (item.partnership) {
                return Number(accumulator) + Number(item?.partnership?.amount ?? 0);
              }
              return Number(accumulator ?? 0) + Number(item?.amount ?? 0);
            }, 0),
            modified_at_timestamp: Date.now(),
            created_by: authorizedUser.user_id,
            modified_by: authorizedUser.user_id,
          },
        });
      }

      return this.get(result?.data?._id);
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
        message: "No transactions record found",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }
    try {
      let result = await this.transactionsRepo.getAggregated([
        {
          $match: { _id: this.config.id(id) },
        },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user",
            pipeline: [
              {
                $project: {
                  status: 1,
                  email: 1,
                  first_name: 1,
                  last_name: 1,
                  address: 1,
                  title: 1,
                  city: 1,
                  state_name: 1,
                  country: 1,
                  zip_code: 1,
                  birth_date: 1,
                  marital_status: 1,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "carts",
            localField: "cart_id",
            foreignField: "_id",
            pipeline: [
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
            ],
            as: "cart",
          },
        },
        {
          $project: {
            user_id: 1,
            cart_id: 1,
            amount: 1,
            created_at_timestamp: 1,
            transaction_reference: 1,
            narration: 1,
            user: 1,
            status: 1,
            cart: 1,
          },
        },
        {
          $addFields: {
            user: { $arrayElemAt: ["$user", 0] },
          },
        },
        {
          $addFields: {
            cart: { $arrayElemAt: ["$cart", 0] },
          },
        },
      ]);
      return result;
    } catch (error) {
      console.log("Error getting transaction by id :>>>>>>>>>>>>>>", error);
      return {
        success: false,
        message: "Internal server error",
        status: this.httpHandler.ERROR_500,
        stack: error,
        data: null,
      };
    }
  }

  async update(data) {
    const authorizedUser = data.authorizedUser;
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
      if (!data.transaction_id) {
        return {
          success: false,
          message: "transactions not found",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }
      let transactions = await this.transactionsRepo.get({
        id: data.transaction_id,
        values: {
          user_id: 1,
          cart_id: 1,
          status: 1,
          transaction_reference: 1,
          narration: 1,
          amount: 1,
          created_at_timestamp: 1,
        },
      });

      if (!transactions || !transactions?.data) {
        return transactions;
      }
      transactions = transactions?.data;

      let result = await this.transactionsRepo.update({
        id: transactions?._id,
        data: {
          cart_id: data.cart_id ? this.config.id(data.cart_id) : transactions.cart_id,
          status: data.status ?? transactions.status,
          transaction_reference: data.transaction_reference ?? transactions.transaction_reference,
          amount: data.amount ?? transactions.amount,
          narration: data.narration ?? transactions.narration,
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
      let result = await this.transactionsRepo.getAll({
        query,
        size,
        page,
        limit,
        values: {
          user_id: 1,
          cart_id: 1,
          amount: 1,
          created_at_timestamp: 1,
          transaction_reference: 1,
          narration: 1,
          user: 1,
          status: 1,
          cart: 1,
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

  async getAllAggregated({ cart_id, user_id, transaction_reference, size, page, limit }) {
    try {
      let result = await this.transactionsRepo.getAllAggregated([
        {
          $facet: {
            data: [
              {
                $match: cart_id
                  ? { cart_id: this.config.id(cart_id) }
                  : user_id
                  ? { user_id: this.config.id(user_id) }
                  : transaction_reference
                  ? { transaction_reference }
                  : {},
              },
              {
                $skip: (size && page) ? (parseInt(page) * parseInt(size)) : 0,
              },
              {
                $limit: limit ? parseInt(limit) : 20,
              },
              {
                $lookup: {
                  from: "users",
                  localField: "user_id",
                  foreignField: "_id",
                  as: "user",
                  pipeline: [
                    {
                      $project: {
                        status: 1,
                        email: 1,
                        first_name: 1,
                        last_name: 1,
                        address: 1,
                        title: 1,
                        city: 1,
                        state_name: 1,
                        country: 1,
                        zip_code: 1,
                        birth_date: 1,
                        marital_status: 1,
                      },
                    },
                  ],
                },
              },
              {
                $lookup: {
                  from: "carts",
                  localField: "cart_id",
                  foreignField: "_id",
                  pipeline: [
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
                  ],
                  as: "cart",
                },
              },
              {
                $project: {
                  user_id: 1,
                  cart_id: 1,
                  amount: 1,
                  created_at_timestamp: 1,
                  transaction_reference: 1,
                  narration: 1,
                  user: 1,
                  status: 1,
                  cart: 1,
                },
              },
              {
                $addFields: {
                  user: { $arrayElemAt: ["$user", 0] },
                },
              },
              {
                $addFields: {
                  cart: { $arrayElemAt: ["$cart", 0] },
                },
              },
            ],
            count: [
              {
                $count: "total",
              },
            ],
          },
        },
      ]);
      return {
        success: true,
        message: "Success",
        status: this.httpHandler.HANDLED,
        stack: null,
        data: result?.data[0]?.data,
        count: result?.data[0]?.count[0]?.total,
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

  async getUserPartnershipSubscriptions({ user_id, page, size, limit }) {
    try {
      let result = await this.transactionsRepo.getAllAggregated([
        {
          $match: user_id ? { user_id: this.config.id(user_id) } : {},
        },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  status: 1,
                  email: 1,
                  first_name: 1,
                  last_name: 1,
                  address: 1,
                  title: 1,
                  city: 1,
                  state_name: 1,
                  country: 1,
                  zip_code: 1,
                  birth_date: 1,
                  marital_status: 1,
                },
              },
            ],
            as: "user",
          },
        },
        {
          $lookup: {
            from: "carts",
            localField: "cart_id",
            foreignField: "_id",
            pipeline: [
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
            ],
            as: "cart",
          },
        },
        {
          $project: {
            user_id: 1,
            cart_id: 1,
            amount: 1,
            created_at_timestamp: 1,
            transaction_reference: 1,
            narration: 1,
            user: 1,
            status: 1,
            cart: 1,
          },
        },
        {
          $addFields: {
            user: { $arrayElemAt: ["$user", 0] },
          },
        },
        {
          $addFields: {
            cart: { $arrayElemAt: ["$cart", 0] },
          },
        },
      ]);

      let items = [];
      if (result.success) {
        for (let item of result.data) {
          if (item?.cart?.items) items.push(item?.cart?.items);
        }
      }

      items = items.flat().filter((item) => item?.partnership_id);
      let unique_items = [];
      for (let item of items) {
        if (item?.partnership && unique_items.length <= 0) {
          unique_items.push(item?.partnership);
        } else {
          if (item?.partnership) {
            let found = unique_items?.find((unique) => unique?._id.toString() === item?.partnership?._id.toString());
            !found && unique_items.push(item?.partnership);
          }
        }
      }

      return {
        success: true,
        message: "Success",
        status: this.httpHandler.HANDLED,
        stack: null,
        data: unique_items,
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
        message: "No transactions found",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }
    try {
      let result = await this.transactionsRepo.delete(id);
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
      let result = await this.transactionsRepo.deleteAll();
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

module.exports = TransactionsService;
