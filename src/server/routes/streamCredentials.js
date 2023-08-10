module.exports = (express, container) => {
  const router = express.Router();
  const streamCredentialsController = container.resolve("streamCredentialsController");
  const auth = container.resolve("auth");
  /* POST group content. */
  router.post("/stream-credentials", auth.auth.bind(auth), streamCredentialsController.create.bind(streamCredentialsController));
  /* GET stream-credentials content by id. */
  router.get("/stream-credentials/:id", streamCredentialsController.get.bind(streamCredentialsController));
  /* GET stream-credentials content by id. */
  router.get("/stream-credentials/:post_id?", streamCredentialsController.getAll.bind(streamCredentialsController));
  /* GET stream-credentials content by email. */
  router.patch("/stream-credentials/:id", auth.auth.bind(auth), streamCredentialsController.update.bind(streamCredentialsController));
  router.delete("/stream-credentials/:id", auth.auth.bind(auth), streamCredentialsController.delete.bind(streamCredentialsController));
  return router;
};
