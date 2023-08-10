const { verify } = require("jsonwebtoken");
class TokenValidator {
  constructor({ httpHelper }) {
    this.httpHelper = httpHelper;
  }
  async auth(req, res, next) {
    let token = req.get("authorization");
    if (!token) {
      return this.httpHelper.respondWith201Unauthorized(res, {
        success: false,
        error: false,
        stack: null,
        data: null,
      });
    }

    token = token.slice(7);
    try {
      let decoded = await verify(token, process.env.TOKEN_TOKEN_SECRET_KEY);
      req.authorizedUser = decoded.user;
      next();
    } catch (error) {
      return this.httpHelper.respondWith500InternalServerError(res, {
        success: false,
        message: "Access denied: Unauthorized access.",
        stack: error,
        error: true,
        data: null,
      });
    }
  }
}

module.exports = TokenValidator;
