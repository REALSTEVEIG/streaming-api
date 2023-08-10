class KtnAdvertisementsService {
  constructor({ ktnAdvertisementsRepo, httpHandler, helpers, fs, path, uuid, config }) {
    this.httpHandler = httpHandler;
    this.ktnAdvertisementsRepo = ktnAdvertisementsRepo;
    this.helpers = helpers;
    this.fs = fs;
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
    if (!data.title) {
      return {
        success: false,
        message: "Bad request: All fields are required.",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }
    try {
      let image_url = "";
      if (data.image) {
        let image = await this.helpers.uploadToAWSS3Bucket(data.image, "/uploads/advertisement-images/");
        if (!image.success) {
          return image;
        }
        image_url = image?.data;
      }

      let result = await this.ktnAdvertisementsRepo.create({
        title: data.title,
        sub_title: data.sub_title,
        description: data.description,
        advert_body: data.advert_body,
        status: "Active",
        image_url: image_url,
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
        message: "No KtnAdvertisements record found",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }
    return await this.ktnAdvertisementsRepo.get({
      id,
      values: {
        status: 1,
        title: 1,
        sub_title: 1,
        description: 1,
        image_url: 1,
        advert_body: 1,
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
      if (!data.advertisement_id) {
        return {
          success: false,
          message: "Advertisement not found",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }

      let advertisement = await this.ktnAdvertisementsRepo.get({
        id: data.advertisement_id,
        values: {
          title: 1,
          description: 1,
          status: 1,
          image_url: 1,
          sub_title: 1,
          advert_body: 1,
        },
      });

      if (!advertisement || !advertisement?.data) {
        return advertisement;
      }
      advertisement = advertisement?.data;
      let image_url = advertisement?.image_url;
      if (data.image) {
        let image = await this.helpers.uploadToAWSS3Bucket(data.image, "/uploads/advertisement-images/");
        if (!image.success) {
          return image;
        }
        image_url = image?.data;
      }
      let result = await this.ktnAdvertisementsRepo.update({
        id: data.advertisement_id,
        data: {
          title: data.title ?? advertisement.title,
          sub_title: data.sub_title ?? advertisement.sub_title,
          description: data.description ?? advertisement.description,
          status: data.status ?? advertisement.status,
          advert_body: data.advert_body ?? advertisement.advert_body,
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
      let result = await this.ktnAdvertisementsRepo.getAll({
        query,
        size,
        page,
        limit,
        values: {
          status: 1,
          title: 1,
          sub_title: 1,
          description: 1,
          image_url: 1,
          advert_body: 1,
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

  
  async getAllAggregated({ query, size, page, limit }) {
    try {
      let result = await this.ktnAdvertisementsRepo.getAllAggregated([
        {
          $facet: {
            data:[
        {
          $match: {
            status: { $eq: "Active" },
          },
        },
        {
          $sort: { created_at_timestamp: -1, _id:1 },
        },
        {
          $skip: (size && page) ? (parseInt(page) * parseInt(size)) : 0,
        },
        {
          $limit: limit ? parseInt(limit) : 20,
        },
        {
          $project: {
            status: 1,
          title: 1,
          sub_title: 1,
          description: 1,
          image_url: 1,
          advert_body: 1,
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
      console.log("Error getting posts", error);
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
      let result = await this.ktnAdvertisementsRepo.delete(id);
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
      let result = await this.ktnAdvertisementsRepo.deleteAll();
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

module.exports = KtnAdvertisementsService;
