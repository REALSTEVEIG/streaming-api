module.exports = (express, container) => {
  const router = express.Router();
  const partnersController = container.resolve("partnersController");
  const auth = container.resolve("auth");
  /* POST group content. */
  router.post("/partners", auth.auth.bind(auth), partnersController.create.bind(partnersController));
  /* GET partners content by id. */
  router.get("/partners/:id", partnersController.get.bind(partnersController));
  /* GET partners content by id. */
  router.get("/partners", partnersController.getAll.bind(partnersController));
  /* GET partners content by email. */
  router.patch("/partners/:id", auth.auth.bind(auth), partnersController.update.bind(partnersController));
  router.delete("/partners/:id", auth.auth.bind(auth), partnersController.delete.bind(partnersController));

  return router;
};
