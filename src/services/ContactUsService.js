class ContactUsService {
  constructor({ contactUsRepo, httpHandler, helpers, path, uuid, config }) {
    this.httpHandler = httpHandler;
    this.contactUsRepo = contactUsRepo;
    this.helpers = helpers;
    this.path = path;
    this.uuid = uuid;
    this.config = config;
  }

  async create(data) {
    if (!data.email) {
      return {
        success: false,
        message: "Email address is required.",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }

    try {
      let result = await this.contactUsRepo.create({
        email: data.email,
        subject: data.subject,
        message: data.message,
        first_name: data.first_name,
        last_name: data.last_name,
        isPrayerRequest: data.isPrayerRequest,
        created_at_timestamp: Date.now(),
        modified_at_timestamp: Date.now(),
        created_by: data.email,
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
        message: "No contactUs record found",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }

    return await this.contactUsRepo.get({
      id,
      values: {
        status: 1,
        subject: 1,
        email: 1,
        message: 1,
        first_name: 1,
        last_name: 1,
        isPrayerRequest: 1,
        created_at_timestamp: 1,
      },
    });
  }

  async update(data) {
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
      if (!data.contact_us_id) {
        return {
          success: false,
          message: "contactUs not found",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }
      let contactUs = await this.contactUsRepo.get({
        id: data.contact_us_id,
      });

      if (!contactUs || !contactUs?.data) {
        return contactUs;
      }
      contactUs = contactUs?.data;

      let result = await this.contactUsRepo.update({
        id: data.contact_us_id,
        data: {
          first_name: data.first_name ?? contactUs.first_name,
          last_name: data.last_name ?? contactUs.last_name,
          email: data.email ?? contactUs.email,
          subject: data.subject ?? contactUs.subject,
          message: data.message ?? contactUs.message,
          isPrayerRequest: data.isPrayerRequest ?? contactUs.isPrayerRequest,
          status: data.status ?? contactUs.status,
          modified_at_timestamp: Date.now(),
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
      let result = await this.contactUsRepo.getAll({
        query,
        size,
        page,
        limit,
        values: {
          status: 1,
          subject: 1,
          email: 1,
          message: 1,
          first_name: 1,
          last_name: 1,
          isPrayerRequest: 1,
          created_at_timestamp: 1,
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
        message: "No contactUs found",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }
    try {
      let result = await this.contactUsRepo.delete(id);
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
      let result = await this.contactUsRepo.deleteAll();
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

module.exports = ContactUsService;
