class TokenService {
  constructor({ userTokenRepo, userStatus, httpHandler, helpers, userRepo, emailTemplates }) {
    this.httpHandler = httpHandler;
    this.userTokenRepo = userTokenRepo;
    this.userStatus = userStatus;
    this.helpers = helpers;
    this.userRepo = userRepo;
    this.emailTemplates = emailTemplates;
  }

  async sendOTP(data) {
    if (!data.email && !data.email) {
      return {
        success: false,
        message: "Invalid email address",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }

    if (data.email && !this.helpers.isEmailValid(data.email)) {
      return {
        success: false,
        message: `Invalid email address format "${data.email}".`,
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }

    try {
      let user = await this.userRepo.getAll({
        query: { email: data.email },
        values: {
          status: 1,
          app_identifier: 1,
          device_id: 1,
          email: 1,
          fcm_token: 1,
          first_name: 1,
          last_name: 1,
          other_names: 1,
          phone_number: 1,
          last_online_timestamp: 1,
          image: 1,
        },
      });

      if (!user.data || !user.data.length) {
        return {
          success: false,
          message: `Email address '${data.email}' is not recognized.`,
          status: this.httpHandler.ERROR_400,
          stack: null, 
          data: null,
        };
      }

      if (!user.success || !user.data[0]) {
        return user;
      }
      user = user.data[0];
      const otp = this.helpers.generateOTP();
      // console.log("OTP: ", otp);
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
          message: `Unable to generate OTP at the moment. Kindly try again.`,
          status: this.httpHandler.ERROR_400,
          stack: null,
          data: null,
        };
      }

      // let email = await this.helpers.sendEmail({
      //   email: user.email,
      //   subject : "OTP",
      //   template_id: this.emailTemplates.PHONE_NUMBER_RESET_OTP,
      //   html : {
      //     otp: otp,
      //     operating_system: data.phone_model,
      //     company_name: "KORSGY",
      //     name: `${user.first_name}`,
      //     company_address: process.env.CONTACT_ADDRESS,
      //     product_name: "Bream VoD",
      //     live_chat_url: process.env.LIVE_CHAT_URL,
      //     support_email: process.env.SUPPORT_EMAIL,
      //     support_phone: process.env.SUPPORT_PHONE,
      //     sender_name: process.env.SENDER_NAME,
      //     support_url: process.env.SUPPORT_URL,
      //     date: new Date(Number(data.timestamp)).toString(),
      //   },
      // });
 
      let email = await this.helpers.sendEmail({
        email: user.email,
        subject: "OTP",
        html : this.emailTemplates.otpVerification({otp : otp})
      });


      if (!email.success) {
        email.status = this.httpHandler.ERROR_400;
        email.success = false;
        email.message = `We were unable to send you an email at the moment.`;
        return email;
      }

      email.message = `An email has been sent to your email address - ${data.email} with more details. Kindly follow to reset your pin`;
      return email;
    } catch (error) {
      console.log("Error sending an OTP :>>>>>>>>>>>>>", error);
      return {
        success: false,
        message: "Internal server error",
        status: this.httpHandler.ERROR_500,
        stack: error,
        data: null,
      };
    }
  }

  async confirmOTP(data) {
    console.log("data", data)
    if (!data) {
      return {
        success: false,
        message: "Invalid OTP",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }

    if (!data.otp) {
      return {
        success: false,
        message: "Invalid OTP",
        status: this.httpHandler.ERROR_400,
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

    if (mins > 30) {
      await this.userTokenRepo.update({
        id: otp?._id.toString(),
        data: {
          token_id: otp.token_id.toString(),
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

    // console.log("otp : ", otp)

    let user = await this.userRepo.get({ id: otp.user_id });

    // console.log("user", user);

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

    let result = await this.userTokenRepo.update({
      id: otp?._id.toString(),
      data: {
        token_id: otp.user_id,
        user_id: otp.user_id,
        status: this.userStatus.CONFIRMED,
        updated_at_device_timestamp: Number(data.timestamp),
        updated_at_server_timestamp: new Date().getTime(),
      },
    });

    if (!result.success) {
      return {
        success: false,
        message: "Couldn't complete your verification. Please try again.",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }

    result.message = `Congratulations! OTP confirmed.`;
    return result;
  }
}

module.exports = TokenService;
