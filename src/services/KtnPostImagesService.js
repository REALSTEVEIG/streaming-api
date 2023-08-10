class KtnPostImagesService {
  constructor({ ktnPostImagesRepo, httpHandler, helpers, path, uuid, config }) {
    this.httpHandler = httpHandler;
    this.ktnPostImagesRepo = ktnPostImagesRepo;
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
    if (!data.post_id) {
      return {
        success: false,
        message: "Select a category.",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }

    let image_url = "";
    if (data.image) {
      let image = await this.helpers.uploadToAWSS3Bucket(data.image, "/uploads/posts-images/");
      if (!image.success) {
        return image;
      }
      image_url = image?.data;
    }

    try {
      let result = await this.ktnPostImagesRepo.create({
        post_id: data.post_id,
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
        imageUrl: this.httpHandler.ERROR_500,
        stack: error,
        data: null,
      };
    }
  }

  async get(id) {
    if (!id) {
      return {
        success: false,
        message: "No user record found",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }
    try {
      let result = await this.ktnPostImagesRepo.getAggregated([
        {
          $match: { _id: this.config.id(id) },
        },
      ]);
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
      if (!data.image_id) {
        return {
          success: false,
          message: "Records not found",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }
      let image = await this.ktnPostImagesRepo.get({
        id: data.image_id,
      });

      if (!image || !image?.data) {
        return image;
      }
      image = image?.data;

      let image_url = image?.image_url;
      if (data.image) {
        let image = await this.helpers.uploadToAWSS3Bucket(data.image, "/uploads/posts-images/");
        if (!image.success) {
          return image;
        }
        image_url = image?.data;
      }

      let result = await this.ktnPostImagesRepo.update({
        id: data.image_id,
        data: {
          post_id: data.post_id ?? KtnPressImages.post_id,
          description: data.description ?? KtnPressImages.description,
          imageUrl: image_url,
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
        imageUrl: this.httpHandler.ERROR_500,
        stack: error,
        data: null,
      };
    }
  }

  async getAll({ query, size, page, limit }) {
    try {
      let result = await this.ktnPostImagesRepo.getAll({
        query,
        size,
        page,
        limit,
        values: {
          post_id,
          image_url: 1,
        },
      });

      return {
        success: true,
        message: "Success",
        imageUrl: this.httpHandler.HANDLED,
        stack: null,
        data: result?.data,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Internal server error",
        imageUrl: this.httpHandler.ERROR_500,
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
        imageUrl: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }
    try {
      let result = await this.ktnPostImagesRepo.delete(id);
      return result;
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Internal server error",
        imageUrl: this.httpHandler.ERROR_500,
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
      let result = await this.ktnPostImagesRepo.deleteAll();
      return result;
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Internal server error",
        imageUrl: this.httpHandler.ERROR_500,
        stack: error,
        data: null,
      };
    }
  }
}

module.exports = KtnPostImagesService;
