class PostAgendaService {
  constructor({ postAgendaRepo, httpHandler, helpers, path, uuid, config }) {
    this.httpHandler = httpHandler;
    this.postAgendaRepo = postAgendaRepo;
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
      let result = await this.postAgendaRepo.create({
        post_id: this.config.id(data.post_id),
        title: data.title,
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
        message: "No Agenda record found",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }
    let agenda = await this.postAgendaRepo.get({
      id: id,
      values: {
        post_id: 1,
        title: 1,
        status: 1,
      },
    });
    return agenda;
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
      if (!data.agenda_id) {
        return {
          success: false,
          message: "Agenda not found",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }
      let agenda = await this.postAgendaRepo.get({
        id: data.agenda_id,
      });
      if (!agenda || !agenda?.data) {
        return agenda;
      }
      agenda = agenda?.data;

      let result = await this.postAgendaRepo.update({
        id: data.agenda_id,
        data: {
          post_id: data.post_id ? this.config.id(data.post_id) : agenda.post_id,
          title: data.title ?? agenda.title,
          status: data.status ?? agenda.status,
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
      let result = await this.postAgendaRepo.getAll({
        query,
        size,
        page,
        limit,
        values: {
          post_id: 1,
          title: 1,
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
        message: "No Agenda found",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }
    try {
      let result = await this.postAgendaRepo.delete(id);
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
      let result = await this.postAgendaRepo.deleteAll();
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

module.exports = PostAgendaService;
