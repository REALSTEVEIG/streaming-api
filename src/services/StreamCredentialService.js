class StreamCredentialService {
  constructor({ streamCredentialRepo, ktnPostsRepo, httpHandler, fs, helpers, path, uuid, config }) {
    this.httpHandler = httpHandler;
    this.streamCredentialRepo = streamCredentialRepo;
    this.ktnPostsRepo = ktnPostsRepo;
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
    if (!data.post_id) {
      return {
        success: false,
        message: "Select a post to associate the streaming credentials to.",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }

    try {
      const post = await this.ktnPostsRepo.get({ id: data.post_id });
      if (!post.success || !post.data) {
        return {
          success: false,
          message: `Selected post doesn't exist.`,
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }

      const existingCredentials = await this.streamCredentialRepo.getAll({
        query: { post_id: data.post_id },
      });

      if (existingCredentials?.data?.length) {
        return {
          success: false,
          message: `Name '${post?.data?.title}' is already created.`,
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }

      let primary_postal_url = "";
      if (data.primary_postal) {
        let image = await this.helpers.uploadToAWSS3Bucket(data.primary_postal, "/uploads/posts-images/");
        if (!image.success) {
          return image;
        }
        primary_postal_url = image?.data;
      }

      let secondary_postal_url = "";
      if (data.secondary_postal) {
        let image = await this.helpers.uploadToAWSS3Bucket(data.secondary_postal, "/uploads/posts-images/");
        if (!image.success) {
          return image;
        }
        secondary_postal_url = image?.data;
      }

      let tertiary_postal_url = "";
      if (data.tertiary_postal) {
        let image = await this.helpers.uploadToAWSS3Bucket(data.tertiary_postal, "/uploads/posts-images/");
        if (!image.success) {
          return image;
        }
        tertiary_postal_url = image?.data;
      }

      let stream = this.helpers.makeStream(post?.data?.title?.replace(/\s/g, ""), process.env.PUBLIC_URL);

      let result = await this.streamCredentialRepo.create({
        post_id: this.config.id(data.post_id),
        item_type: data.item_type,
        quality: data.quality,
        description: data.description,
        primary_postal_url: primary_postal_url,
        secondary_postal_url: secondary_postal_url,
        tertiary_postal_url: secondary_postal_url,
        scheduled_date: data.scheduled_time,
        owner: data.owner,
        live_streaming_url: stream.stream_live,
        streaming_playback: stream.stream_playback,
        streaming_key: stream.streaming_key,
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
    return await this.streamCredentialRepo.get({
      id,
      values: {
        post_id: 1,
        item_type: 1,
        quality: 1,
        owner: 1,
        primary_postal_url: 1,
        secondary_postal_url: 1,
        tertiary_postal_url: 1,
        scheduled_date: 1,
        live_streaming_url: 1,
        streaming_playback: 1,
        streaming_key: 1,
        description: 1,
        status: 1,
        created_at_timestamp: 1,
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
      if (!data.credential_id) {
        return {
          success: false,
          message: "Records not found",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }
      let credentials = await this.streamCredentialRepo.get({
        id: data.credential_id,
        values: {
          post_id: 1,
          item_type: 1,
          quality: 1,
          live_streaming_url: 1,
          streaming_playback: 1,
          scheduled_date: 1,
          description: 1,
          streaming_key: 1,
          status: 1,
          created_at_timestamp: 1,
        },
      });

      if (!credentials || !credentials?.data) {
        return credentials;
      }
      credentials = credentials?.data;

      let primary_postal_url = credentials.primary_postal_url;
      if (data.primary_postal) {
        let image = await this.helpers.uploadToAWSS3Bucket(data.primary_postal, "/uploads/posts-images/");
        if (!image.success) {
          return image;
        }
        primary_postal_url = image?.data;
      }

      let secondary_postal_url = credentials.secondary_postal_url;
      if (data.secondary_postal) {
        let image = await this.helpers.uploadToAWSS3Bucket(data.secondary_postal, "/uploads/posts-images/");
        if (!image.success) {
          return image;
        }
        secondary_postal_url = image?.data;
      }

      let tertiary_postal_url = credentials.tertiary_postal_url;
      if (data.tertiary_postal) {
        let image = await this.helpers.uploadToAWSS3Bucket(data.tertiary_postal, "/uploads/posts-images/");
        if (!image.success) {
          return image;
        }
        tertiary_postal_url = image?.data;
      }

      let result = await this.streamCredentialRepo.update({
        id: data.credential_id,
        data: {
          post_id: data.post_id ? this.config.id(data.post_id) : credentials.post_id,
          item_type: data.item_type ?? credentials.item_type,
          quality: data.quality ?? credentials.quality,
          primary_postal_url: primary_postal_url,
          secondary_postal_url: secondary_postal_url,
          tertiary_postal_url: tertiary_postal_url,
          status: data.status ?? credentials?.status,
          scheduled_date: data.scheduled_time ?? credentials?.scheduled_date,
          live_streaming_url: credentials?.live_streaming_url,
          description: data.description ?? credentials?.description,
          streaming_playback: credentials?.streaming_playback,
          streaming_key: credentials?.streaming_key,
          owner: data.owner ?? credentials?.owner,
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
      let result = await this.streamCredentialRepo.getAll({
        query,
        size,
        page,
        limit,
        values: {
          post_id: 1,
          item_type: 1,
          quality: 1,
          primary_postal_url: 1,
          secondary_postal_url: 1,
          tertiary_postal_url: 1,
          scheduled_date: 1,
          live_streaming_url: 1,
          streaming_playback: 1,
          description: 1,
          streaming_key: 1,
          owner: 1,
          status: 1,
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
  async getLiveEvents({ live, size, page, limit }) {
    try {
      let result = await this.streamCredentialRepo.getAllAggregated([
        {
          $facet: {
            data: [
              { $match: { status: "Active" } },
              { $sort: { created_at_timestamp: -1, _id: 1 } },
              {
                $skip: (size && page) ? parseInt(page) * parseInt(size) : 0,
              },
              {
                $limit: limit ? parseInt(limit) : 20,
              },
              {
                $lookup: {
                  from: "ktn_posts",
                  localField: "post_id",
                  foreignField: "_id",
                  as: "post",
                },
              },
              {
                $project: {
                  post_id: 1,
                  item_type: 1,
                  quality: 1,
                  primary_postal_url: 1,
                  secondary_postal_url: 1,
                  tertiary_postal_url: 1,
                  live_streaming_url: 1,
                  streaming_playback: 1,
                  scheduled_date: 1,
                  description: 1,
                  streaming_key: 1,
                  owner: 1,
                  status: 1,
                  post: 1,
                  created_at_timestamp: 1,
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
  async getVideos({ videos, size, page, limit }) {
    try {
      let result = await this.streamCredentialRepo.getAllAggregated([
        {
          $facet: {
            data: [
              { $match: { status: { $ne: "Pending" } } },
              { $sort: { created_at_timestamp: -1, _id: 1 } },
              {
                $skip: (size && page) ? parseInt(page) * parseInt(size) : 0,
              },
              { $limit: limit ? Number(limit) : 12 },
              {
                $lookup: {
                  from: "ktn_posts",
                  localField: "post_id",
                  foreignField: "_id",
                  as: "post",
                },
              },
              {
                $project: {
                  post_id: 1,
                  item_type: 1,
                  quality: 1,
                  primary_postal_url: 1,
                  secondary_postal_url: 1,
                  tertiary_postal_url: 1,
                  live_streaming_url: 1,
                  streaming_playback: 1,
                  scheduled_date: 1,
                  description: 1,
                  streaming_key: 1,
                  owner: 1,
                  status: 1,
                  post: 1,
                  created_at_timestamp: 1,
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
      console.log("Error getting videos :>>>>>>>>>>>>>>>>>>>>>", error);
      return {
        success: false,
        message: "Internal server error",
        status: this.httpHandler.ERROR_500,
        stack: error,
        data: null,
      };
    }
  }
  async getActiveLiveEvent({ active, live, size, page, limit }) {
    try {
      let result = await this.streamCredentialRepo.getAggregated([
              { $match: { status: "Active" } },
              { $limit: 1 },
              {
                $lookup: {
                  from: "ktn_posts",
                  localField: "post_id",
                  foreignField: "_id",
                  as: "post",
                },
              },
              {
                $addFields: {
                  post: { $arrayElemAt: ["$post", 0] },
                },
              },
              {
                $project: {
                  post_id: 1,
                  item_type: 1,
                  quality: 1,
                  primary_postal_url: 1,
                  secondary_postal_url: 1,
                  tertiary_postal_url: 1,
                  live_streaming_url: 1,
                  streaming_playback: 1,
                  scheduled_date: 1,
                  description: 1,
                  streaming_key: 1,
                  owner: 1,
                  status: 1,
                  post: 1,
                  created_at_timestamp: 1,
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
      let result = await this.streamCredentialRepo.delete(id);
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
      let result = await this.streamCredentialRepo.deleteAll();
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

module.exports = StreamCredentialService;
