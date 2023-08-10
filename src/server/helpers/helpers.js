class Helpers {
  constructor({ fetch, httpHandler, crypto, uuid, fs, s3Options, emailTransporter }) {
    this.fetch = fetch;
    this.httpHandler = httpHandler;
    this.uuid = uuid;
    this.crypto = crypto;
    this.fs = fs;
    this.s3Options = s3Options;
    this.emailTransporter = emailTransporter;
  }

  isEmailValid(email) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return true;
    }
    return false;
  }

  async sendEmail(data) {
    if (!this.isEmailValid(data.email)) {
      return {
        success: false,
        message: `Email address not valid "${data.email}"`,
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }

    let mailOptions = {
      from: '"Kingdom TV" <kingdom24tv@gmail.com>',
      to: data.email,
      subject: data.subject,
      html: data.html
  };
   
    let result = await this.emailTransporter.sendMail(mailOptions);


    if (!result.accepted?.length) {
      return {
        success: false,
        message: `Unable to send an email to "${data.email}"`,
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    }

    return {
      success: true,
      message: `Verification Email sent to your email ${data.email}.`,
      status: this.httpHandler.HANDLED,
      stack: null,
      data: null,
    };
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  convertToCurrency(amount) {
    return amount.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  }

  getNairaSign() {
    return "₦";
  }

  getTimeStamp(timestamp) {
    let date = timestamp ? new Date(timestamp) : new Date();
    let year = date.getFullYear();
    let month = date.getMonth() < 9 ? "0" + (date.getMonth() + 1).toString() : date.getMonth() + 1;
    let day = date.getDate() < 10 ? "0" + date.getDate().toString() : date.getDate();
    let hour = date.getHours() < 10 ? "0" + date.getHours().toString() : date.getHours();
    let minutes = date.getMinutes() < 10 ? "0" + date.getMinutes().toString() : date.getMinutes();
    let seconds = date.getSeconds() < 10 ? "0" + date.getSeconds().toString() : date.getSeconds();

    let formattedDate = `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
    return formattedDate;
  }

  /**
   *
   * @param {*} baseUrl BaseUrl must not end with forward / and is required to be only ip or domain without schema
   * @param {*} streamName
   * @param {*} schema  colon and double slash must be included
   * @returns
   */
  makeStream(streamName, baseUrl, schema = "rtmp://") {
    //stream model
    let modelMock = {
      stream_url: "",
      stream_key: "",
      stream_playback: "",
      stream_live: "",
    };
    //remake name
    const rb = streamName.toString().toLowerCase();
    //remaking constructor
    modelMock.stream_url = schema + process.env.PUBLIC_URL + "/live";
    //stream name should not carry white spaces or special characters and must be small letters
    //this will be used as key
    modelMock.stream_key = rb;
    //this next code is for playback in real lifetime
    modelMock.stream_live = schema + process.env.PUBLIC_URL + "/live/" + rb;
    //playback url for VOD
    modelMock.stream_playback =
      "http://" +
      baseUrl +
      "/media/" +
      new Date().getUTCFullYear() +
      "/" +
      new Date().getUTCMonth() +
      "/" +
      new Date().getUTCDate() +
      "/" +
      rb +
      ".mp4";
    //return formatted object
    return modelMock;
  }

  async uploadToAWSS3Bucket(file, dir) {
    try {
      const fileStream = this.fs.createReadStream(file.tempFilePath);
      let key = `${dir}${this.uuid.v4()}.${file.name.split(".").splice(-1)[0]}`;
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Body: fileStream,
        Key: key,
      };

      let result = await this.s3Options.putObject(uploadParams);

      console.log("Result :>>>>>>>>>>>", result);
      if (result?.$metadata?.httpStatusCode == 200 || result?.$metadata?.httpStatusCode == "200") {
        return {
          success: true,
          message: "Success",
          status: this.httpHandler.HANDLED,
          stack: null,
          data: `${process.env.IMAGE_PUBLIC_URL}/${key}`,
        };
      }
      return {
        success: false,
        message: "Unable to save Images.",
        status: this.httpHandler.ERROR_400,
        stack: null,
        data: null,
      };
    } catch (error) {
      console.log("Error :>>>>>>>>>>>>.", error);
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
module.exports = Helpers;
