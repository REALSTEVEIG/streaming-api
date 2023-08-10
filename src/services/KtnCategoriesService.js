class KtnCategoriesService {
  constructor({ ktnCategoriesRepo, httpHandler, helpers, path, uuid, config }) {
    this.httpHandler = httpHandler;
    this.ktnCategoriesRepo = ktnCategoriesRepo;
    this.helpers = helpers;
    this.path = path;
    this.uuid = uuid;
    this.config = config;
  }

  async create(data) {
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
    if (!data.name) {
      return {
        success: false,
        message: "All fields are required.",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }

    try {
      const existingCategories = await this.ktnCategoriesRepo.getAll({
        query: { name: data.name },
      });

      if (existingCategories.data.length) {
        return {
          success: false,
          message: `Name '${data.name}' is already created.`,
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }

      if (!existingCategories.success) {
        return existingCategories;
      }

      let result = await this.ktnCategoriesRepo.create({
        name: data.name,
        description: data.description,
        status: "Active",
        created_at_timestamp: Date.now(),
        modified_at_timestamp: null,
        created_by: authorizedUser.user_id,
        modified_by: null,
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
    return await this.ktnCategoriesRepo.get({
      id,
      values: {
        status: 1,
        name: 1,
        description: 1,
      },
    });
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
      if (!data.category_id) {
        return {
          success: false,
          message: "Records not found",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }
      let category = await this.ktnCategoriesRepo.get({
        id: data.category_id,
        values: {
          name: 1,
          description: 1,
          status: 1,
        },
      });

      if (!category || !category?.data) {
        return category;
      }
      category = category?.data;

      let result = await this.ktnCategoriesRepo.update({
        id: data.category_id,
        data: {
          name: data.name ?? category.name,
          description: data.description ?? category.description,
          status: data.status ?? category.status,
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
      let result = await this.ktnCategoriesRepo.getAll({
        query,
        size,
        page,
        limit,
        values: {
          status: 1,
          name: 1,
          description: 1,
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
      let result = await this.ktnCategoriesRepo.delete(id);
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
      let result = await this.ktnCategoriesRepo.deleteAll();
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

module.exports = KtnCategoriesService;
