module.exports = (express, container) => {
  const router = express.Router();
  const settingsController = container.resolve("settingsController");
  const auth = container.resolve("auth");
  /* POST group content. */
  router.post("/settings", auth.auth.bind(auth), settingsController.create.bind(settingsController));
  /* GET categories content by id. */
  router.get("/settings/:id", settingsController.get.bind(settingsController));
  router.get("/settings-active/:section", settingsController.getActiveBanner.bind(settingsController));
  /* GET categories content by id. */
  router.get("/settings/:section?", settingsController.getAll.bind(settingsController));
  /* GET categories content by email. */
  router.patch("/settings/:id/:status?", auth.auth.bind(auth), settingsController.update.bind(settingsController));
  router.delete("/settings/:id", auth.auth.bind(auth), settingsController.delete.bind(settingsController));
  return router;
};
