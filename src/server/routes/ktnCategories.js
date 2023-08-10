module.exports = (express, container) => {
  const router = express.Router();
  const ktnCategoriesController = container.resolve("ktnCategoriesController");
  const auth = container.resolve("auth");
  /* POST group content. */
  router.post("/categories", auth.auth.bind(auth), ktnCategoriesController.create.bind(ktnCategoriesController));
  /* GET categories content by id. */
  router.get("/categories/:id", ktnCategoriesController.get.bind(ktnCategoriesController));
  /* GET categories content by id. */
  router.get("/categories", ktnCategoriesController.getAll.bind(ktnCategoriesController));
  /* GET categories content by email. */
  router.patch("/categories/:id", auth.auth.bind(auth), ktnCategoriesController.update.bind(ktnCategoriesController));
  router.delete("/categories/:id", auth.auth.bind(auth), ktnCategoriesController.delete.bind(ktnCategoriesController));
  return router;
};
