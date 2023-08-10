class KtnPartnershipsService {
  constructor({ ktnPartnershipsRepo, httpHandler, fs, helpers, path, uuid, config }) {
    this.httpHandler = httpHandler;
    this.ktnPartnershipsRepo = ktnPartnershipsRepo;
    this.fs = fs;
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
      const existingPartnership = await this.ktnPartnershipsRepo.getAll({
        query: { name: data.name },
      });

      if (existingPartnership?.data?.length) {
        return {
          success: false,
          message: `Name '${data.name}' is already created.`,
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }

      if (!existingPartnership.success) {
        return existingPartnership;
      }

      let image_url = "";
      if (data.image) {
        let image = await this.helpers.uploadToAWSS3Bucket(data.image, "/uploads/partnership-images/");
        if (!image.success) {
          return image;
        }
        image_url = image?.data;
      }

      let result = await this.ktnPartnershipsRepo.create({
        name: data.name,
        description: data.description,
        amount: Number(data.amount),
        frequency: data.frequency,
        color: data.color,
        image_url: image_url,
        status: "Active",
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
        message: "No record found",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }
    try {
      let result = await this.ktnPartnershipsRepo.get({
        id: this.config.id(id),
        values: {
          name: 1,
          amount: 1,
          color: 1,
          owner: 1,
          frequency: 1,
          image_url: 1,
          description: 1,
          status: 1,
        },
      });
      return result;
    } catch (error) {
      console.log("Error getting user by id :>>>>>>>>>>>>>>", error);
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
      if (!data.partnership_id) {
        return {
          success: false,
          message: "Records not found",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }
      let partnership = await this.ktnPartnershipsRepo.get({
        id: data.partnership_id,
        values: {
          name: 1,
          amount: 1,
          color: 1,
          owner: 1,
          frequency: 1,
          image_url: 1,
          description: 1,
          status: 1,
        },
      });

      if (!partnership || !partnership?.data) {
        return partnership;
      }
      partnership = partnership?.data;

      let image_url = partnership?.image_url;
      if (data.image) {
        let image = await this.helpers.uploadToAWSS3Bucket(data.image, "/uploads/partnership-images/");
        if (!image.success) {
          return image;
        }
        image_url = image?.data;
      }

      let result = await this.ktnPartnershipsRepo.update({
        id: data.partnership_id,
        data: {
          title: data.title ?? partnership.title,
          description: data.description ?? partnership.description,
          amount: data.amount ? Number(data.amount) : partnership.amount,
          frequency: data.frequency ?? partnership.frequency,
          method_of_payment: data.method_of_payment ?? partnership.method_of_payment,
          color: data.color ?? partnership.color,
          status: data.status ?? partnership.status,
          image_url: image_url,
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
      let result = await this.ktnPartnershipsRepo.getAll({
        query,
        size,
        page,
        limit,
        values: {
          name: 1,
          amount: 1,
          color: 1,
          owner: 1,
          frequency: 1,
          image_url: 1,
          description: 1,
          status: 1,
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
      let result = await this.ktnPartnershipsRepo.delete(id);
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
      let result = await this.ktnPartnershipsRepo.deleteAll();
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

module.exports = KtnPartnershipsService;
