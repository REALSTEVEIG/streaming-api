class SettingsService {
  constructor({ settingRepo, httpHandler, helpers, path, uuid, config }) {
    this.httpHandler = httpHandler;
    this.settingRepo = settingRepo;
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
    if (!data.section) {
      return {
        success: false,
        message: "Category not found.",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }
    try {
      let image_url = "";
      if (data.image) {
        let image = await this.helpers.uploadToAWSS3Bucket(data.image, "/uploads/settings-images/");
        if (!image.success) {
          return image;
        }
        image_url = image?.data;
      }

      let result = await this.settingRepo.create({
        section: data.section,
        image_url: image_url,
        status: "Active",
        created_at_timestamp: Date.now(),
        modified_at_timestamp: Date.now(),
        created_by: authorizedUser.user_id,
        modified_by: authorizedUser.user_id,
      });

      if (result.success) {
        let active_banners = await this.settingRepo.getAllAggregated([
          {
            $match: { $and: [{ section: data.section }, { _id: { $ne: this.config.id(result.data?._id) } }] },
          },
        ]);
        if (active_banners.success) {
          for (let active_banner of active_banners.data) {
            await this.settingRepo.update({
              id: active_banner._id?.toString(),
              data: {
                status: "Inactive",
                image_url: active_banner?.image_url,
                section: active_banner?.section,
              },
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
        message: "No Settings record found",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }
    let settings = await this.settingRepo.get({
      id: id,
      values: {
        section: 1,
        image_url: 1,
        language: 1,
        status: 1,
      },
    });
    return settings;
  }

  async getActiveBanner(section) {
    try {
      let result = await this.settingRepo.getAggregated([
        {
          $match: {
            $and: [{ section: section }, { status: "Active" }],
          },
        },
      ]);

      if (!result?.data) {
        result = await this.settingRepo.getAllAggregated([
          {
            $match: {
              section: section,
            },
          },
        ]);
        return {
          success: true,
          message: "Success",
          status: this.httpHandler.HANDLED,
          stack: null,
          data: result?.data ? result?.data[0] : null,
        };
      }

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

  async deactivateBanner(data, id) {
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
      if (!id) {
        return {
          success: false,
          message: "Banner not found",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }
      let setting = await this.settingRepo.get({
        id: id,
        values: {
          section: 1,
          image_url: 1,
          status: 1,
        },
      });

      if (!setting || !setting?.data) {
        return setting;
      }
      setting = setting?.data;

      if (setting.status == "Inactive") {
        return {
          success: false,
          message: "Success",
          status: this.httpHandler.HANDLED,
          stack: null,
          data: setting,
        };
      }

      let result = await this.settingRepo.update({
        id: setting?._id?.toString(),
        data: {
          section: setting.section,
          image_url: setting.image_url,
          status: "Inactive",
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

  async activateBanner(data, id) {
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
      if (!id) {
        return {
          success: false,
          message: "Banner not found",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }
      let setting = await this.settingRepo.get({
        id: id,
        values: {
          section: 1,
          image_url: 1,
          status: 1,
        },
      });

      if (!setting || !setting?.data) {
        return setting;
      }
      setting = setting?.data;

      if (setting.status == "Active") {
        return {
          success: false,
          message: "Success",
          status: this.httpHandler.HANDLED,
          stack: null,
          data: setting,
        };
      }

      let result = await this.settingRepo.update({
        id: setting?._id?.toString(),
        data: {
          section: setting.section,
          image_url: setting.image_url,
          status: "Active",
          modified_at_timestamp: Date.now(),
          created_by: authorizedUser.user_id,
          modified_by: authorizedUser.user_id,
        },
      });

      if (result.success) {
        let active_banners = await this.settingRepo.getAllAggregated([
          {
            $match: { $and: [{ section: setting.section }, { _id: { $ne: setting?._id } }] },
          },
        ]);
        if (active_banners.success) {
          for (let active_banner of active_banners.data) {
            console.log("active_banner :>>>>>>>>>>>>>>>", active_banner);
            let b = await this.settingRepo.update({
              id: active_banner._id?.toString(),
              data: {
                status: "Inactive",
                image_url: active_banner?.image_url,
                section: active_banner?.section,
              },
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
      if (!data.setting_id) {
        return {
          success: false,
          message: "No records found",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }
      let setting = await this.settingRepo.get({
        id: data.setting_id,
        values: {
          section: 1,
          image_url: 1,
          status: 1,
        },
      });

      if (!setting || !setting?.data) {
        return setting;
      }
      setting = setting?.data;

      let image_url = setting?.image_url;
      if (data.image) {
        let image = await this.helpers.uploadToAWSS3Bucket(data.image, "/uploads/settings-images/");
        if (!image.success) {
          return image;
        }
        image_url = image?.data;
      }

      let result = await this.settingRepo.update({
        id: data.setting_id,
        data: {
          section: data?.section ? data.section : setting.section,
          image_url: image_url,
          status: data.status ?? setting.status,
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
      let result = await this.settingRepo.getAll({
        query,
        size,
        page,
        limit,
        values: {
          section: 1,
          image_url: 1,
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
        message: "Internal server error. Try again.",
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
      let result = await this.settingRepo.delete(id);
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
      let result = await this.settingRepo.deleteAll();
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

module.exports = SettingsService;
