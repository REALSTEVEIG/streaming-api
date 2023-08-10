class PartnersService {
  constructor({ partnersRepo, httpHandler, helpers, path, uuid, config }) {
    this.httpHandler = httpHandler;
    this.partnersRepo = partnersRepo;
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
    if (!data.name) {
      return {
        success: false,
        message: "All fields are required.",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }

    if (data.timestamp && (/[a-zA-Z]/.test(data.timestamp) || isNaN(data.timestamp))) {
      return {
        success: false,
        message: "Invalid date/time.",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }

    if (data.timestamp && Number(data.timestamp) <= 0) {
      return {
        success: false,
        message: `Invalid date/time format.`,
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }

    try {
      const existingpartners = await this.partnersRepo.getAll({
        query: { name: data.name },
      });

      if (existingpartners.data.length) {
        return {
          success: false,
          message: `Name '${data.name}' is already created.`,
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }

      if (!existingpartners.success) {
        return existingpartners;
      }

      let result = await this.partnersRepo.create({
        title: data.title,
        name: data.name,
        logoUrl: data.logoUrl,
        status: data.status,
        created_at_timestamp: Date.now(),
        modified_at_timestamp: Date.now(),
        created_by: authorizedUser.user_id,
        modified_by: authorizedUser.user_id,
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
        message: "No partners record found",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }
  }

  async update(data) {
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

    try {
      if (!data._id) {
        return {
          success: false,
          message: "partners not found",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }
      let partners = await this.partnersRepo.get({
        id: data._id,
        values: {
          name: 1,
          description: 1,
          status: 1,
        },
      });

      if (!partners || !partners?.data) {
        return partners;
      }
      partners = partners?.data;

      let result = await this.partnersRepo.update({
        id: partners._id,
        data: {
          title: data.title ?? partners.title,
          name: data.name ?? partners.name,
          logoUrl: data.logoUrl ?? partners.logoUrl,
          status: data.status ?? partners.status,
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
      let result = await this.partnersRepo.getAll({
        query,
        size,
        page,
        limit,
        values: {
          status: 1,
          name: 1,
          title: 1,
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
        message: "No partners found",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }
    try {
      let result = await this.partnersRepo.delete(id);
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

  async deleteAll() {
    try {
      let result = await this.partnersRepo.deleteAll();
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

module.exports = PartnersService;
