class KtnPostsService {
  constructor({ ktnPostsRepo, httpHandler, helpers, path, uuid, fs, config, postScheduleRepo, postAgendaRepo }) {
    this.httpHandler = httpHandler;
    this.ktnPostsRepo = ktnPostsRepo;
    this.helpers = helpers;
    this.path = path;
    this.fs = fs;
    this.uuid = uuid;
    this.config = config;
    this.postScheduleRepo = postScheduleRepo;
    this.postAgendaRepo = postAgendaRepo;
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
    if (!data.category_id) {
      return {
        success: false,
        message: "Post category is required.",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }
    if (!data.title) {
      return {
        success: false,
        message: "Post title is required.",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }

    let primary_image_url = "";
    if (data.primary_image) {
      let image = await this.helpers.uploadToAWSS3Bucket(data.primary_image, "/uploads/posts-images/");
      if (!image.success) {
        return image;
      }
      primary_image_url = image?.data;
    }

    let secondary_image_url = "";
    if (data.secondary_image) {
      let image = await this.helpers.uploadToAWSS3Bucket(data.secondary_image, "/uploads/posts-images/");
      if (!image.success) {
        return image;
      }
      secondary_image_url = image?.data;
    }

    let tertiary_image_url = "";
    if (data.tertiary_image) {
      let image = await this.helpers.uploadToAWSS3Bucket(data.tertiary_image, "/uploads/posts-images/");
      if (!image.success) {
        return image;
      }
      tertiary_image_url = image?.data;
    }

    try {
      let post_id = this.config.id(this.helpers.generateOTP());
      let result = await this.ktnPostsRepo.create({
        _id: post_id,
        title: data.title,
        category_id: this.config.id(data.category_id),
        description: data.description,
        date_of_release: data.date_of_release,
        speaker_name: data.speaker_name,
        primary_image_url: primary_image_url,
        secondary_image_url: secondary_image_url,
        tertiary_image_url: tertiary_image_url,
        post_body: data.post_body,
        status: "Active",
        created_at_timestamp: Date.now(),
        modified_at_timestamp: Date.now(),
        created_by: authorizedUser.user_id,
        modified_by: null,
      });

      if (result.success) {
        let schedules = data.schedule ? JSON.parse(data.schedule) : null;
        if (schedules && schedules.length > 0) {
          for (let schedule of schedules) {
            await this.postScheduleRepo.create({
              post_id: post_id,
              title: schedule.title,
              speaker_name: schedule.speaker_name,
              image_url: null,
              language: schedule.language,
              location: schedule.location,
              start_time: schedule.start_time,
              end_time: schedule.end_time,
              status: schedule.status,
            });
          }
        }

        let agendas = data.agenda ? JSON.parse(data.agenda) : null;
        if (agendas && agendas.length > 0) {
          for (let agenda of agendas) {
            await this.postAgendaRepo.create({
              post_id: post_id,
              title: agenda.title,
              status: agenda.status,
            });
          }
        }
      }

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
        message: "No post record found",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }
    try {
      let result = await this.ktnPostsRepo.getAggregated([
        {
          $match: { _id: this.config.id(id) },
        },
        {
          $lookup: {
            from: "post_agendas",
            localField: "_id",
            foreignField: "post_id",
            as: "agenda",
          },
        },
        {
          $lookup: {
            from: "post_schedules",
            localField: "_id",
            foreignField: "post_id",
            as: "schedule",
          },
        },
        {
          $lookup: {
            from: "stream_credentials",
            localField: "_id",
            foreignField: "post_id",
            as: "stream",
          },
        },
        {
          $addFields: {
            stream: { $arrayElemAt: ["$stream", 0] },
          },
        },
        {
          $project: {
            title: 1,
            category_id: 1,
            description: 1,
            date_of_release: 1,
            speaker_name: 1,
            primary_image_url: 1,
            secondary_image_url: 1,
            tertiary_image_url: 1,
            post_body: 1,
            status: 1,
            agenda: 1,
            schedule: 1,
            stream: 1,
          },
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
      if (!data.post_id) {
        return {
          success: false,
          message: "Records not found",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }
      let post = await this.ktnPostsRepo.get({
        id: data.post_id,
      });

      if (!post || !post?.data) {
        return post;
      }
      post = post?.data;

      let primary_image_url = post?.primary_image_url;
      if (data.primary_image) {
        let image = await this.helpers.uploadToAWSS3Bucket(data.primary_image, "/uploads/posts-images/");
        if (!image.success) {
          return image;
        }
        primary_image_url = image?.data;
      }

      let secondary_image_url = post?.secondary_image_url;
      if (data.secondary_image) {
        let image = await this.helpers.uploadToAWSS3Bucket(data.secondary_image, "/uploads/posts-images/");
        if (!image.success) {
          return image;
        }
        secondary_image_url = image?.data;
      }

      let tertiary_image_url = post?.tertiary_image_url;
      if (data.tertiary_image) {
        let image = await this.helpers.uploadToAWSS3Bucket(data.tertiary_image, "/uploads/posts-images/");
        if (!image.success) {
          return image;
        }
        tertiary_image_url = image?.data;
      }

      let result = await this.ktnPostsRepo.update({
        id: data.post_id,
        data: {
          description: data.description ?? post.description,
          title: data.title ?? post.title,
          category_id: data.category_id ?? post.category_id,
          description: data.description ?? post.description,
          date_of_release: data.date_of_release ?? post.date_of_release,
          speaker_name: data.speaker_name ?? post.speaker_name,
          primary_image_url: primary_image_url,
          secondary_image_url: secondary_image_url,
          tertiary_image_url: tertiary_image_url,
          post_body: data.post_body ?? post.post_body,
          status: data.status ?? post.status,
          modified_at_timestamp: Date.now(),
          modified_by: authorizedUser.user_id,
        },
      });
      return result;
    } catch (error) {
      console.log("Error Updating Post:>>>>>>>>>>>>>>", error);
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
      let result = await this.ktnPostsRepo.getAllAggregated([
        {
          $facet: {
            data: [
              {
                $skip: (size && page) ? (parseInt(page) * parseInt(size)) : 0,
              },
              {
                $limit: limit ? parseInt(limit) : 20,
              },
              {
                $lookup: {
                  from: "post_agendas",
                  localField: "_id",
                  foreignField: "post_id",
                  as: "agenda",
                },
              },
              {
                $lookup: {
                  from: "post_schedules",
                  localField: "_id",
                  foreignField: "post_id",
                  as: "schedule",
                },
              },
              {
                $project: {
                  title: 1,
                  category_id: 1,
                  description: 1,
                  date_of_release: 1,
                  speaker_name: 1,
                  primary_image_url: 1,
                  secondary_image_url: 1,
                  tertiary_image_url: 1,
                  post_body: 1,
                  status: 1,
                  agenda: 1,
                  schedule: 1,
                },
              },
            ],
            count: [
              {
                $count: "count",
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
        data: result?.data,
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

  async getPostsByCategory({ category_id, size, page, limit }) {
    try {
      let result = await this.ktnPostsRepo.getAllAggregated([
        {
          $facet: {
            data: [
              {
                $match: category_id ? { category_id: this.config.id(category_id) } : {},
              },
              {
                $skip: (size && page) ? (parseInt(page) * parseInt(size)) : 0,
              },
              {
                $limit: limit ? parseInt(limit) : 20,
              },
              {
                $lookup: {
                  from: "post_agendas",
                  localField: "_id",
                  foreignField: "post_id",
                  as: "agenda",
                },
              },
              {
                $lookup: {
                  from: "post_schedules",
                  localField: "_id",
                  foreignField: "post_id",
                  as: "schedule",
                },
              },
              {
                $project: {
                  title: 1,
                  category_id: 1,
                  description: 1,
                  date_of_release: 1,
                  speaker_name: 1,
                  primary_image_url: 1,
                  secondary_image_url: 1,
                  tertiary_image_url: 1,
                  post_body: 1,
                  status: 1,
                  agenda: 1,
                  schedule: 1,
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

      console.log("Result :>>>>>>>>>>>>>>>", result);

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
  async getUpcomingEvents({ upcoming, size, page, limit }) {
    try {
      let result = await this.ktnPostsRepo.getAllAggregated([
        {
          $facet: {
            data:[
        {
          $sort: { created_at_timestamp: -1, _id:1 },
        },
        {
          $skip: (size && page) ? (parseInt(page) * parseInt(size)) : 0,
        },
        {
          $limit: !isNaN(limit) ? parseInt(limit) : 20,
        },
        {
          $lookup: {
            from: "post_agendas",
            localField: "_id",
            foreignField: "post_id",
            as: "agenda",
          },
        },
        {
          $lookup: {
            from: "post_schedules",
            localField: "_id",
            foreignField: "post_id",
            as: "schedule",
          },
        },
        {
          $project: {
            title: 1,
            category_id: 1,
            description: 1,
            date_of_release: 1,
            speaker_name: 1,
            primary_image_url: 1,
            secondary_image_url: 1,
            tertiary_image_url: 1,
            post_body: 1,
            status: 1,
            agenda: 1,
            schedule: 1,
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
      return {
        success: false,
        message: "Internal server error",
        status: this.httpHandler.ERROR_500,
        stack: error,
        data: null,
      };
    }
  }

  async getLatestEvents({ latest, size, page, limit }) {
    try {
      let result = await this.ktnPostsRepo.getAllAggregated([
        {
          $facet: {
            data:[
        {
          $match: {
            status: { $ne: "Ended" },
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
          $lookup: {
            from: "post_agendas",
            localField: "_id",
            foreignField: "post_id",
            as: "agenda",
          },
        },
        {
          $lookup: {
            from: "post_schedules",
            localField: "_id",
            foreignField: "post_id",
            as: "schedule",
          },
        },
        {
          $project: {
            title: 1,
            category_id: 1,
            description: 1,
            date_of_release: 1,
            speaker_name: 1,
            primary_image_url: 1,
            secondary_image_url: 1,
            tertiary_image_url: 1,
            post_body: 1,
            status: 1,
            agenda: 1,
            schedule: 1,
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
      let result = await this.ktnPostsRepo.delete(id);
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
      let result = await this.ktnPostsRepo.deleteAll();
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

module.exports = KtnPostsService;
