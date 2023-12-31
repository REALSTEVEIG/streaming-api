class AdminUserService {
  constructor({
    adminUserRepo,
    httpHandler,
    helpers,
    userStatus,
    uuid,
    emailTemplates,
    path,
    fs,
    genSaltSync,
    compareSync,
    hashSync,
    jwt,
    config,
    userTokenRepo,
  }) {
    this.httpHandler = httpHandler;
    this.adminUserRepo = adminUserRepo;
    this.helpers = helpers;
    this.emailTemplates = emailTemplates;
    this.userStatus = userStatus;
    this.path = path;
    this.fs = fs;
    this.jwt = jwt;
    this.uuid = uuid;
    this.genSaltSync = genSaltSync;
    this.compareSync = compareSync;
    this.hashSync = hashSync;
    this.config = config;
    this.userTokenRepo = userTokenRepo;
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
    if (!data.first_name || !data.last_name || !data.email) {
      return {
        success: false,
        message: "Bad request: All fields are required.",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }

    if (!this.helpers.isEmailValid(data.email)) {
      return {
        success: false,
        message: `Invalid email address.`,
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }

    try {
      const existingUser = await this.adminUserRepo.getAll({
        query: { email: data.email },
      });

      if (existingUser.data.length) {
        return {
          success: false,
          message: `Email address - '${data.email}' is already registered.`,
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }

      if (!existingUser.success) {
        return existingUser;
      }

      let image_url = "";
      if (data.image) {
        let image = await this.helpers.uploadToAWSS3Bucket(data.image, "/uploads/users-images/");
        if (!image.success) {
          return image;
        }
        image_url = image?.data;
      }
      let user_id = this.config.id(this.helpers.generateOTP());

      const salt = this.genSaltSync(10);
      let password = await this.hashSync(data.email, salt);

      let result = await this.adminUserRepo.create({
        _id: user_id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        status: "Active",
        isAdmin: true,
        created_at_timestamp: data.timestamp,
        password: password,
        modified_at_timestamp: null,
        created_by: user_id,
        image: image_url
          ? {
              image_url: `${process.env.API_BASE_URL}/uploads/users-images/${image_url}`,
              mimeType: data.image?.mimeType,
            }
          : null,
        modified_by: null,
      });
      if(result.success){
        let email = this.helpers.sendEmail({
          email: data.email,
          subject: "Signup Notification!",
          html: this.emailTemplates.adminAccountNotification({
            email: data.email,
            password: data.email
          })
        })
        if(email.success){
          return {
            success: true,
            message: "Success",
            status: this.httpHandler.HANDLED,
            stack: null,
            data: null,
          };
        }
      }
      return result;
    } catch (error) {
      console.log("Error creating user :>>>>>>>>>>>>>", error);
      return {
        success: false,
        message: "Internal server error",
        status: this.httpHandler.ERROR_500,
        stack: error,
        data: null,
      };
    }
  }

  async authenticate(data) {
    if (!data.email || !this.helpers.isEmailValid(data.email) || !data.password) {
      return {
        success: false,
        message: "Invalid email address or password",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }

    try {
      let user = await this.adminUserRepo.getAll({ query: { email: data.email } });

      if (!user.data || !user.data.length) {
        user.message = `Your account is not found. Kindly try again or create one`;
        user.data = null;
        user.success = false;
        user.status = this.httpHandler.ERROR_400;

        return user;
      }

      user = user.data[0];
      //Check if password doesn't match

      if (user.status === this.userStatus.BLOCKED) {
        return {
          success: false,
          message: "Your account has been blocked. Contact the admin.",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }
      const check = this.compareSync(data.password, user.password);

      if (!check) {
        return {
          success: false,
          message: "Wrong email or password.",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }

      const loggedInUser = {
        first_name: user.first_name,
        last_name: user.last_name,
        other_names: user.other_names,
        email: user.email,
        status: user.status,
        isAdmin: user.isAdmin,
        user_id: user._id.toString(),
        image: user.image,
      };

      const access_token = this.jwt.sign({ user: loggedInUser }, process.env.SECRET_KEY, {
        expiresIn: "9999hr",
      });

      return {
        success: true,
        message: "Success",
        status: this.httpHandler.HANDLED,
        stack: null,
        data: { access_token },
      };
    } catch (error) {
      console.log("Error getting user :>>>>>>>>>>>>>", error);
      return {
        success: false,
        message: "Internal server error",
        status: this.httpHandler.ERROR_500,
        stack: error,
        data: null,
      };
    }
  }

  async getAuthenticatedUser(data) {
    if (!data || !data.isAdmin) {
      return {
        success: false,
        message: "No user record found",
        status: this.httpHandler.ERROR_401,
        stack: null,
        data: null,
      };
    }
    try {
      let result = await this.adminUserRepo.getAggregated([
        {
          $match: { _id: this.config.id(data.user_id) },
        },
        {
          $project: {
            status: 1,
            email: 1,
            first_name: 1,
            last_name: 1,
            address: 1,
            title: 1,
            city: 1,
            state_name: 1,
            country: 1,
            zip_code: 1,
            birth_date: 1,
            marital_status: 1,
            created_at_timestamp: 1,
            image: 1,
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
      let result = await this.adminUserRepo.getAggregated([
        {
          $match: { _id: this.config.id(id) },
        },
        {
          $project: {
            status: 1,
            email: 1,
            first_name: 1,
            last_name: 1,
            isAdmin: 1,
            address: 1,
            title: 1,
            city: 1,
            state_name: 1,
            country: 1,
            zip_code: 1,
            birth_date: 1,
            marital_status: 1,
            created_at_timestamp: 1,
            image: 1,
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
    console.log("data", data)
    console.log("auth", data.authorizedUser.user_id)
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
      if (!data.user_id || !data.authorizedUser.user_id) {
        return {
          success: false,
          message: "User not found",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }
      let user = await this.adminUserRepo.get({
        id: data.user_id,
        values: {
          first_name: 1,
          last_name: 1,
          other_names: 1,
          email: 1,
          status: 1,
          image: 1,
        },
      });

      if (!user || !user?.data) {
        return user;
      }
      user = user?.data;

      let image_url = user?.image?.image_url;
      if (data.image) {
        let image = await this.helpers.uploadToAWSS3Bucket(data.image, "/uploads/users-images/");
        if (!image.success) {
          return image;
        }
        image_url = image?.data;
      }

      let result = await this.adminUserRepo.update({
        id: user?._id,
        data: {
          first_name: data.first_name ?? user.first_name,
          other_names: data.other_names ?? user.other_names,
          title: data.title ?? user.title,
          phone_number: data.phone_number ?? user.phone_number,
          address: data.address ?? user.address,
          city: data.city ?? user.city,
          state_name: data.state_name ?? user.state_name,
          country_of_origin: data.country_of_origin ?? user.country_of_origin,
          country_of_residence: data.country_of_residence ?? user.country_of_residence,
          zip_code: data.zip_code ?? user.zip_code,
          birth_date: data.birth_date ?? user.birth_date,
          marital_status: data.marital_status ?? user.marital_status,
          modified_at_timestamp: Date.now(),
          email: data.email ?? user?.email,
          status: data.status ?? "Active",
          created_by: authorizedUser.user_id,
          image: {
            image_url: image_url,
            mimeType: image_url,
          },
          modified_by: authorizedUser.user_id,
        },
      });
      return result;
    } catch (error) {
      console.log("Error updating user :>>>>>>>>>>>>>>>>", error);
      return {
        success: false,
        message: "Internal server error",
        status: this.httpHandler.ERROR_500,
        stack: error,
        data: null,
      };
    }
  }

  async blockUser(user_id, authorizedUser) {
    if (!authorizedUser || !authorizedUser.isAdmin) {
      return {
        success: false,
        message: "Unauthorized access.",
        status: this.httpHandler.ERROR_401,
        stack: null,
        data: null,
      };
    }

    if (!user_id) {
      return {
        success: false,
        message: `Invalid user.`,
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }

    try {
      let user = await this.adminUserRepo.get({
        id: user_id,
        values: {
          first_name: 1,
          last_name: 1,
          device_id: 1,
          other_names: 1,
          email: 1,
          status: 1,
          fcm_token: 1,
          last_online_timestamp: 1,
          image: 1,
        },
      });

      if (!user || !user?.data) {
        return user;
      }
      user = user?.data;

      let result = await this.adminUserRepo.update({
        id: user_id,
        data: {
          status: this.userStatus.BLOCKED,
        },
      });
      return result;
    } catch (error) {
      console.log("Error block user :>>>>>>>>>>>>>>>>", error);
      return {
        success: false,
        message: "Internal server error",
        status: this.httpHandler.ERROR_500,
        stack: error,
        data: null,
      };
    }
  }

  async unBlockUser(user_id, authorizedUser) {
    if (!authorizedUser || !authorizedUser.isAdmin) {
      return {
        success: false,
        message: "Unauthorized access.",
        status: this.httpHandler.ERROR_401,
        stack: null,
        data: null,
      };
    }

    if (!user_id) {
      return {
        success: false,
        message: `Invalid user.`,
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }

    try {
      let user = await this.adminUserRepo.get({
        id: user_id,
        values: {
          first_name: 1,
          last_name: 1,
          device_id: 1,
          other_names: 1,
          email: 1,
          status: 1,
          fcm_token: 1,
          last_online_timestamp: 1,
          image: 1,
        },
      });

      if (!user || !user?.data) {
        return user;
      }
      user = user?.data;

      let result = await this.adminUserRepo.update({
        id: user_id,
        data: {
          status: this.userStatus.ACTIVE,
        },
      });
      return result;
    } catch (error) {
      console.log("Error unblock user :>>>>>>>>>>>>>>>>", error);
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
      let result = await this.adminUserRepo.getAll({
        query,
        size,
        page,
        limit,
        values: {
          status: 1,
          email: 1,
          first_name: 1,
          last_name: 1,
          address: 1,
          title: 1,
          city: 1,
          state_name: 1,
          isAdmin: 1,
          country: 1,
          zip_code: 1,
          birth_date: 1,
          marital_status: 1,
          created_at_timestamp: 1,
          image: 1,
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
      console.log("Error getting all users :>>>>>>>>>>>>>>>", error);
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
    if (!id) {
      return {
        success: false,
        message: "No user found",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }
    try {
      let result = await this.adminUserRepo.delete(id);
      return result;
    } catch (error) {
      console.log("Error deleting user :>>>>>>>>>>>>>>>>", error);
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
      let result = await this.adminUserRepo.deleteAll();
      return result;
    } catch (error) {
      console.log("Error getting all users :>>>>>>>>>>>>>>>", error);
      return {
        success: false,
        message: "Internal server error",
        status: this.httpHandler.ERROR_500,
        stack: error,
        data: null,
      };
    }
  }

  async changePassword(data) {
    const authorizedUser = data.authorizedUser;
    if (!authorizedUser) {
      return {
        success: false,
        message: "Unauthorized access",
        status: this.httpHandler.ERROR_401,
        stack: null,
        data: null,
      };
    }

    if (!data.old_password || !data.new_password) {
      return {
        success: false,
        message: "Password doesn't match.",
        status: this.httpHandler.ERROR_401,
        stack: null,
        data: null,
      };
    }

    try {
      let user = await this.adminUserRepo.get({ id: authorizedUser.user_id });
      if (!user.success) {
        return user;
      }
      user = user.data;
      const check = this.compareSync(data.old_password.toString(), user.password);

      if (!check) {
        return {
          success: false,
          message: "Old password doesn't match.",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }

      const salt = this.genSaltSync(10);
      let new_password = await this.hashSync(data.new_password.toString(), salt);

      if (!new_password) {
        return {
          success: false,
          message: "Couldn't change your password, please try again.",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }
      let timestamp = new Date().getTime();

      let result = await this.adminUserRepo.update({
        id: authorizedUser.user_id,
        data: {
          salt: salt,
          password: new_password,
          updated_by: authorizedUser.user_id,
          updated_at_device_timestamp: Number(data.timestamp),
          updated_at_server_timestamp: timestamp,
        },
      });

      if (!result.success) return result;

      const loggedInUser = {
        first_name: user.first_name,
        last_name: user.last_name,
        other_names: user.other_names,
        email: user.email,
        phone_number: data.new_phone_number,
        status: user.status,
        user_id: user._id.toString(),
      };

      const token = this.jwt.sign({ user: loggedInUser }, process.env.SECRET_KEY, {
        expiresIn: "9999hr",
      });

      result.data = {
        access_token: token,
      };

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

  async confirmPasswordResetOTP(data) {
    if (!data.session_token || !data.otp) {
      return {
        success: false,
        message: "Invalid phone number or access token.",
        status: this.httpHandler.ERROR_401,
        stack: null,
        data: null,
      };
    }

    try {
      //Extracts the session token to verify it was generated by us
      let sessionOTP = data?.session_token?.slice(7);
      let decoded = null;
      try {
        decoded = await this.jwt.verify(sessionOTP, process.env.SECRET_KEY);
      } catch (e) {
        return {
          success: false,
          message: "Invalid token, access denied.",
          status: this.httpHandler.ERROR_401,
          stack: null,
          data: null,
        };
      }

      if (!decoded || !decoded.otp) {
        return {
          success: false,
          message: "Invalid Access.",
          status: this.httpHandler.ERROR_401,
          stack: null,
          data: null,
        };
      }

      let otp = await this.userTokenRepo.getAll({ query: { token: data.otp } });

      if (!otp.data || !otp.data[0]) {
        return {
          success: false,
          message: "Invalid OTP",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }

      otp = otp.data[0];

      if (decoded?.otp?.toString() !== otp?.token?.toString()) {
        return {
          success: false,
          message: "Your OTP doesn't match. Kindly try again.",
          status: this.httpHandler.ERROR_401,
          stack: null,
          data: null,
        };
      }

      if (otp.status === "Expired" || otp.status === "Confirmed") {
        return {
          success: false,
          message: "The OTP is expired. Kindly request a new one.",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }

      let start = new Date(otp.start_time);
      let end = new Date(otp.expiry_time);

      let diff = end - start;
      let mins = Math.round(((diff % 86400000) % 3600000) / 60000);

      if (mins > 15) {
        await this.userTokenRepo.update({
          id: otp.user_id,
          data: {
            token_id: otp._id.toString(),
            user_id: otp.user_id,
            status: "Expired",
            updated_at_device_timestamp: Number(data.timestamp),
            updated_at_server_timestamp: new Date().getTime(),
          },
        });
        return {
          success: false,
          message: "This token has expired",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }

      let token = await this.userTokenRepo.update({
        id: otp?.user_id,
        data: {
          token_id: otp._id,
          user_id: this.config.id(otp.user_id),
          status: "Confirmed",
          updated_at_device_timestamp: Number(data.timestamp),
          updated_at_server_timestamp: new Date().getTime(),
        },
      });

      if (token.success) {
        const signedSuccess = this.jwt.sign({ _id: otp._id.toString() }, process.env.CONFIRM_PASSWORD_SECRET_TOKEN, {
          expiresIn: "1000s",
        });

        return {
          success: false,
          message: "Unable to validate your OTP. Kindly try again.",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: {
            token: signedSuccess,
          },
        };
      }
      return token;
    } catch (error) {
      console.log("Error confirming password reset OTP :>>>>>>>>>", error);
      return {
        success: false,
        message: "Internal server error",
        status: this.httpHandler.ERROR_500,
        stack: error,
        data: null,
      };
    }
  }

  async requestPasswordReset(data) {
    if (!data.email || !this.helpers.isEmailValid(data.email)) {
      return {
        success: false,
        message: "Invalid email",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }
    try {
      let user = await this.adminUserRepo.getAll({
        query: { email: data.email },
      });

      if (!user.success || !user.data[0]) {
        return user;
      }

      user = user.data[0];

      let otp = this.helpers.generateOTP();

      let start = new Date();
      let end = new Date(start);
      end.setMinutes(end.getMinutes() + 15);

      const token = await this.userTokenRepo.create({
        user_id: user._id.toString(),
        token: otp,
        start_time: start.getTime(),
        expiry_time: end.getTime(),
        created_at_device_timestamp: Number(data.timestamp),
        created_at_server_timestamp: new Date().getTime(),
        status: "Active",
      });

      if (!token.success) {
        return {
          success: false,
          message: "Unable to generate OTP at the moment.",
          status: this.httpHandler.ERROR_400,
          stack: error,
          data: null,
        };
      }

      let email = await this.helpers.sendEmail({
        email: data.email,
        html: this.emailTemplates.otpVerification({otp}),
        subject: 'NOTICE!!! Request for password reset'
      });

      if (!email.success) {
        email.status = this.httpHandler.ERROR_400;
        email.success = false;
        email.message = `We were unable to send you an email at the moment.`;
        return email;
      }

      email.message = `Your request to reset your password is received. Kindly confirm the OTP sent to your email.`;
      const signedOtp = this.jwt.sign({ otp: otp, id : user._id.toString() }, process.env.CONFIRM_PASSWORD_SECRET_TOKEN, {
        expiresIn: "1000s",
      });

      return { ...email, session_token: signedOtp };
    } catch (error) {
      console.log("Error requesting password reset :>>>>>>>>>>>>>", error);
      return {
        success: false,
        message: "Internal server error",
        status: this.httpHandler.ERROR_500,
        stack: error,
        data: null,
      };
    }
  }

  async resetPassword(data) {
    if (!data.session_token || !data.otp) {
      return {
        success: false,
        message: "Invalid phone number or access token.",
        status: this.httpHandler.ERROR_401,
        stack: null,
        data: null,
      };
    }

    try {
      let sessionOTP = data?.session_token?.slice(7);
      let decoded = null;

      decoded = await this.jwt.verify(sessionOTP, process.env.CONFIRM_PASSWORD_SECRET_TOKEN);

      if (!decoded) {
        return {
          success: false,
          message: "Invalid Access.",
          status: this.httpHandler.ERROR_401,
          stack: null,
          data: null,
        };
      }

      let user = await this.adminUserRepo.get({ id: decoded.id });

      if (!user.success || !user.data) {
        return {
          success: false,
          message: "Couldn't identify your account",
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }

      user = user.data;

      let timestamp = new Date().getTime();

      const salt = this.genSaltSync(10);
      let password = await this.hashSync(data.password.toString(), salt);

      let update = await this.adminUserRepo.update({
        id: user?._id,
        data: {
          salt: salt,
          password: password,
          updated_by: data.user_id,
          updated_at_device_timestamp: Number(data.timestamp),
          updated_at_server_timestamp: timestamp,
        },
      });

      // let email = await this.helpers.sendEmail({
      //   email: user.email,
      //   template_id: this.emailTemplates.PHONE_NUMBER_CHANGE_SUCCESS,
      //   body: {
      //     operating_system: data.device_id,
      //     company_name: "Kingdom Television Network",
      //     name: `${user.first_name}`,
      //     company_address: process.env.CONTACT_ADDRESS,
      //     product_name: "Kingdom Television Network",
      //     live_chat_url: process.env.LIVE_CHAT_URL,
      //     support_email: process.env.SUPPORT_EMAIL,
      //     support_phone: process.env.SUPPORT_PHONE,
      //     sender_name: process.env.SENDER_NAME,
      //     support_url: process.env.SUPPORT_URL,
      //     date: new Date(Number(data.timestamp)).toString(),
      //   },
      // });

      // if (!email.success) {
      //   email.status = this.httpHandler.ERROR_400;
      //   email.success = false;
      //   email.message = `Your password has been changed successful. We were unable to send you an email at the moment.`;
      //   return email;
      // }
      // email.message = `Your password has been changed successful.`;
      return update;
    } catch (error) {
      console.log("Error resetting password :>>>>>>>>>>>>>", error);
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

module.exports = AdminUserService;
