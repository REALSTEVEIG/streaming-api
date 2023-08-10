module.exports = (express, container) => {
  const router = express.Router();
  const userController = container.resolve("adminUserController");
  const tokenController = container.resolve("tokenController");
  const auth = container.resolve("auth");

  /* POST user profile. */
  router.post("/admin/users", auth.auth.bind(auth), userController.create.bind(userController));
  /* POST user profile. */
  router.put("/admin/users/:user_id", auth.auth.bind(auth), userController.update.bind(userController));
  /* GET user profile. */
  router.get("/admin/users/:id", auth.auth.bind(auth), userController.get.bind(userController));
  /* PUT user profile. */
  router.patch("/admin/block-user/:id", auth.auth.bind(auth), userController.blockUser.bind(userController));
  /* PUT user profile. */
  router.patch("/admin/unblock-user/:id", auth.auth.bind(auth), userController.unBlockUser.bind(userController));
  /* POST authenticate user. */
  router.post("/admin/authenticate", userController.auth.bind(userController));
  router.get("/admin/authorized-user", auth.auth.bind(auth), userController.getAuthenticatedUser.bind(userController));
  /* POST user otp. */
  router.post("/admin/send-otp", tokenController.sendOTP.bind(tokenController));
  /* POST user otp. */
  router.post("/admin/request-password-reset", userController.requestPasswordReset.bind(userController));
  /* POST reset pin. */
  router.post("/admin/reset-password", userController.resetPassword.bind(userController));
  /* POST confirm pin reset OTP. */
  router.post("/admin/confirm-otp", tokenController.confirmOTP.bind(tokenController));
  /* POST change pin. */
  router.post("/admin/change-password", auth.auth.bind(auth), userController.changePassword.bind(userController));
  /* GET user transactions. */
  router.get("/admin/users", auth.auth.bind(auth), userController.getAll.bind(userController));
  /* GET user transactions. */
  router.get("/admin/users-by-email/:email", userController.getUserByEmail.bind(userController));
  /* RETURN router. */
  return router;
};
