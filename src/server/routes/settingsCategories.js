module.exports = (express, container) => {
  const router = express.Router();
  const settingsCategoriesController = container.resolve("settingsCategoriesController");
  const auth = container.resolve("auth");
  /* POST group content. */
  router.post("/settings-categories", auth.auth.bind(auth), settingsCategoriesController.create.bind(settingsCategoriesController));
  /* GET categories content by id. */
  router.get("/settings-categories/:id", settingsCategoriesController.get.bind(settingsCategoriesController));
  /* GET categories content by id. */
  router.get("/settings-categories", settingsCategoriesController.getAll.bind(settingsCategoriesController));
  /* GET categories content by email. */
  router.patch("/settings-categories/:id", auth.auth.bind(auth), settingsCategoriesController.update.bind(settingsCategoriesController));
  router.delete("/settings-categories/:id", auth.auth.bind(auth), settingsCategoriesController.delete.bind(settingsCategoriesController));
  return router;
};
