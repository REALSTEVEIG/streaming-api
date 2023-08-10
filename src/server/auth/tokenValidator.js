const { verify } = require("jsonwebtoken");
class TokenValidator {
  constructor({ httpHelper }) {
    this.httpHelper = httpHelper;
  }
  async auth(req, res, next) {
    let token = req.get("authorization");
    console.log("token" , token)  
    if (!token) {
      return this.httpHelper.respondWith401Unauthorized(res, {
        success: false,
        message: "Access denied: Unauthorized access",
        error: false,
        stack: null,
        data: null,
      });
    }

    token = token.slice(7);
    try {
      let decoded = await verify(token, process.env.SECRET_KEY);
      req.authorizedUser = decoded.user;
      next();
    } catch (error) {
      console.log("Error :>>>>>>>>>>>>>>>>>>", error);
      return this.httpHelper.respondWith401Unauthorized(res, {
        success: false,
        message: "Access denied: Unauthorized access.",
        stack: error,
        error: true,
        data: null,
      });
    }
  }
  /**
   * This middleware is used to validate the session
   * token sent to user after they have confirmed their OTP
   * during first registration.
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  async signUpTokenValidator(req, res, next) {
    
    let token = req.get("authorization");
    if (!token) {
      return this.httpHelper.respondWith401Unauthorized(res, {
        success: false,
        error: false,
        stack: null,
        data: null,
      });
    }

    token = token.slice(7);
    try {
      let decoded = await verify(token, process.env.SECRET_KEY);
      req.user_id = decoded.user_id;
      next();
    } catch (error) {
      console.log("Token Validation Failed :>>>>>>>>>>>", error);
      return this.httpHelper.respondWith500InternalServerError(res, {
        success: false,
        message: "Unable to validate your access. Kindly confirm your OTP.",
        stack: error,
        error: true,
        data: null,
      });
    }
  }
}

module.exports = TokenValidator;
