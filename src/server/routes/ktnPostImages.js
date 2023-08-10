module.exports = (express, container) => {
  const router = express.Router();
  const ktnPostImagesController = container.resolve("ktnPostImagesController");
  const auth = container.resolve("auth");
  /* POST group content. */
  router.post("/post-images", auth.auth.bind(auth), ktnPostImagesController.create.bind(ktnPostImagesController));
  /* GET post-images content by id. */
  router.get("/post-images/:id", ktnPostImagesController.get.bind(ktnPostImagesController));
  /* GET post-images content by id. */
  router.get("/post-images", ktnPostImagesController.getAll.bind(ktnPostImagesController));
  /* GET post-images content by email. */
  router.patch("/post-images/:id", auth.auth.bind(auth), ktnPostImagesController.update.bind(ktnPostImagesController));
  router.delete("/post-images/:id", auth.auth.bind(auth), ktnPostImagesController.update.bind(ktnPostImagesController));

  return router;
};
