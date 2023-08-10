class PostAgenda {
  constructor({ client, config, httpHandler }) {
    this.httpHandler = httpHandler;
    this.objectId = config.id;
    this.db = client.db(config.dbName, config.dbConfig).collection("post_agendas");
  }

  async create(data) {
    try {
      let result = await this.db.insertOne(data);
      if (!result.insertedId.toString()) {
        return {
          success: false,
          message: "Unknown error occurred",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }
      return {
        success: true,
        message: "Success",
        status: this.httpHandler.HANDLED,
        stack: null,
        data: { agenda_id: result.insertedId.toString() },
      };
    } catch (error) {
      console.log("Error creating agenda :>>>>>>>>>>>", error);
      return {
        success: false,
        message: "Internal server error",
        status: this.httpHandler.ERROR_500,
        stack: error,
        data: null,
      };
    }
  }

  async update({ id, data }) {
    try {
      let result = await this.db.updateOne(
        { _id: this.objectId(id) },
        {
          $set: data,
        }
      );
      if (!result.acknowledged) {
        return {
          success: false,
          message: "Unknown error occurred",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }
      return {
        success: true,
        message: "Success",
        status: this.httpHandler.HANDLED,
        stack: null,
        data: null,
      };
    } catch (error) {
      console.log("Error updating agenda :>>>>>>>>>>>>>", error);
      return {
        success: false,
        message: "Internal server error",
        status: this.httpHandler.ERROR_500,
        stack: error,
        data: null,
      };
    }
  }

  async get({ id, values }) {
    try {
      let result = await this.db
        .find({ _id: this.objectId(id) })
        .project(values ?? {})
        .toArray();
      result = result[0];
      if (!result) {
        return {
          success: false,
          message: "Unknown error occurred",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }
      return {
        success: true,
        message: "Success",
        status: this.httpHandler.HANDLED,
        stack: null,
        data: result,
      };
    } catch (error) {
      console.log("Error getting agenda by id :>>>>>>>>>>>>>>>", error);
      return {
        success: false,
        message: "Internal server error",
        status: this.httpHandler.ERROR_500,
        stack: error,
        data: null,
      };
    }
  }

  async search({ query, search_field, size, page, limit, values }) {
    try {
      let result;
      if (size || page || limit) {
        result = await this.db
          .find(query ? { [search_field]: { $regex: query } } : {})
          .skip(parseInt(page) > 0 ? (parseInt(page) - 1) * parseInt(size) : 0)
          .limit(parseInt(limit))
          .project(values ?? {})
          .toArray();
      } else {
        result = await this.db
          .find(query ? { [search_field]: { $regex: query } } : {})
          .project(values ?? {})
          .toArray();
      }
      if (!result) {
        return {
          success: false,
          message: "Unknown error occurred",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }
      return {
        success: true,
        message: "Success",
        status: this.httpHandler.HANDLED,
        stack: null,
        data: result,
      };
    } catch (error) {
      console.log("Error searching agendas :>>>>>>>>>>", error);
      return {
        success: false,
        message: "Internal server error",
        status: this.httpHandler.ERROR_500,
        stack: error,
        data: null,
      };
    }
  }

  async getAll({ query, size, page, limit, values }) {
    try {
      let result;
      if (size || page || limit) {
        result = await this.db
          .find(query ? query : {})
          .skip(parseInt(page) > 0 ? (parseInt(page) - 1) * parseInt(size) : 0)
          .limit(parseInt(limit))
          .project(values ?? {})
          .toArray();
      } else {
        result = await this.db
          .find(query ? query : {})
          .project(values ?? {})
          .toArray();
      }
      if (!result) {
        return {
          success: false,
          message: "Unknown error occurred",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }
      return {
        success: true,
        message: "Success",
        status: this.httpHandler.HANDLED,
        stack: null,
        data: result,
      };
    } catch (error) {
      console.log("Error getting all schedules :>>>>>>>>", error);
      return {
        success: false,
        message: "Internal server error",
        status: this.httpHandler.ERROR_500,
        stack: error,
        data: null,
      };
    }
  }

  async delete(id) {
    try {
      let result = await this.db.deleteOne({ _id: this.objectId(id) });
      if (result.deletedCount < 1) {
        return {
          success: false,
          message: "No records deleted",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }
      return {
        success: true,
        message: "Success",
        status: this.httpHandler.HANDLED,
        stack: null,
        data: null,
      };
    } catch (error) {
      console.log("Error deleting agenda :>>>>>>>>>>>>", error);
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
      let result = await this.db.deleteMany({});
      if (result.deletedCount < 1) {
        return {
          success: false,
          message: "No records deleted",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }
      return {
        success: true,
        message: "Success",
        status: this.httpHandler.HANDLED,
        stack: null,
        data: null,
      };
    } catch (error) {
      console.log("Error deleting all agendas :>>>>>>>>>>>>>>>", error);
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

module.exports = PostAgenda;
