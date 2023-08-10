class PostScheduleService {
  constructor({ postScheduleRepo, httpHandler, helpers, path, uuid, config }) {
    this.httpHandler = httpHandler;
    this.postScheduleRepo = postScheduleRepo;
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
        message: "Post not found.",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }
    try {
      let image_url = "";
      if (data.image) {
        let image = await this.helpers.uploadToAWSS3Bucket(data.image, "/uploads/posts-images/");
        if (!image.success) {
          return image;
        }
        image_url = image?.data;
      }

      let result = await this.postScheduleRepo.create({
        post_id: this.config.id(data.post_id),
        title: data.title,
        speaker_name: data.speaker_name,
        image_url: image_url,
        language: data.language,
        location: data.location,
        start_time: data.start_time,
        end_time: data.end_time,
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
        message: "No Schedule record found",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }
    let schedule = await this.postScheduleRepo.get({
      id: id,
      values: {
        post_id: 1,
        title: 1,
        image_url: 1,
        language: 1,
        location: 1,
        start_time: 1,
        end_time: 1,
        status: 1,
      },
    });
    return schedule;
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
      if (!data.schedule_id) {
        return {
          success: false,
          message: "Schedule not found",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }
      let schedule = await this.postScheduleRepo.get({
        id: data.schedule_id,
        values: {
          post_id: 1,
          title: 1,
          image_url: 1,
          language: 1,
          location: 1,
          speaker_name: 1,
          start_time: 1,
          end_time: 1,
          status: 1,
        },
      });

      if (!schedule || !schedule?.data) {
        return schedule;
      }
      schedule = schedule?.data;

      let image_url = schedule?.image_url;
      if (data.image) {
        let image = await this.helpers.uploadToAWSS3Bucket(data.image, "/uploads/posts-images/");
        if (!image.success) {
          return image;
        }
        image_url = image?.data;
      }

      let result = await this.postScheduleRepo.update({
        id: data.schedule_id,
        data: {
          post_id: data?.post_id ? this.config.id(data.post_id) : schedule.post_id,
          title: data.title ?? schedule.title,
          image_url: image_url,
          language: data.language ?? schedule.language,
          location: data.location ?? schedule.location,
          start_time: data.start_time ?? schedule.start_time,
          speaker_name: data.speaker_name ?? schedule.speaker_name,
          end_time: data.end_time ?? schedule.end_time,
          status: data.status ?? schedule.status,
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
      let result = await this.postScheduleRepo.getAll({
        query,
        size,
        page,
        limit,
        values: {
          post_id: 1,
          title: 1,
          image_url: 1,
          language: 1,
          location: 1,
          start_time: 1,
          speaker_name: 1,
          end_time: 1,
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
        message: "No Schedule found",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }
    try {
      let result = await this.postScheduleRepo.delete(id);
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
      let result = await this.postScheduleRepo.deleteAll();
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

module.exports = PostScheduleService;
