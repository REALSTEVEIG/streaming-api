module.exports = (express, container) => {
  const router = express.Router();
  const userController = container.resolve("userController");
  const tokenController = container.resolve("tokenController");
  const auth = container.resolve("auth");

  /* POST user profile. */
  router.post("/users", userController.create.bind(userController));   
  /* POST user profile. */
  router.patch("/users", auth.auth.bind(auth), userController.update.bind(userController));
  /* POST user profile. */
  router.post("/logout", auth.auth.bind(auth), userController.logout.bind(userController));
  /* PUT user profile. */
  router.patch("/block-user/:id", auth.auth.bind(auth), userController.blockUser.bind(userController));
  /* PUT user profile. */
  router.patch("/unblock-user/:id", auth.auth.bind(auth), userController.unBlockUser.bind(userController));
  /* GET user profile. */
  router.get("/users/:id", auth.auth.bind(auth), userController.get.bind(userController));
  /* GET user profile. */
  router.get("/authorized-user", auth.auth.bind(auth), userController.getAuthenticatedUser.bind(userController));
  /* POST authenticate user. */
  router.post("/authenticate", userController.auth.bind(userController));
  /* POST user otp. */
  router.post("/send-otp", tokenController.sendOTP.bind(tokenController));
  /* POST user otp. */
  router.post("/create-password", auth.signUpTokenValidator.bind(auth), tokenController.sendOTP.bind(tokenController));
  /* POST user otp. */
  router.post("/request-password-reset", userController.requestPasswordReset.bind(userController));
  /* POST user otp. */
  router.post("/confirm-password-reset", userController.confirmPasswordResetOTP.bind(userController));
  /* POST confirm otp. */
  router.post("/confirm-otp", tokenController.confirmOTP.bind(tokenController));
  /* POST reset pin. */
  router.post("/reset-password", userController.resetPassword.bind(userController));
  /* POST change pin. */
  router.post("/change-password", auth.auth.bind(auth), userController.changePassword.bind(userController));
  /* GET user transactions. */
  router.get("/users", auth.auth.bind(auth), userController.getAll.bind(userController));
  /* GET user transactions. */
  router.get("/users-by-email/:email", userController.getUserByEmail.bind(userController));
  /* RETURN router. */
  return router;
};
