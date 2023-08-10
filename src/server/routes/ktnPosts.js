module.exports = (express, container) => {
  const router = express.Router();
  const ktnPostsController = container.resolve("ktnPostsController");
  const auth = container.resolve("auth");
  /* POST group content. */
  router.post("/posts", auth.auth.bind(auth), ktnPostsController.create.bind(ktnPostsController));
  /* GET posts content by id. */
  router.get("/posts/:id", ktnPostsController.get.bind(ktnPostsController));
  /* GET posts content by id. */
  // router.get("/posts", ktnPostsController.getAll.bind(ktnPostsController));
  /* GET posts content by id. */
  router.get(
    "/posts/:category_id?/:live?/:videos?/:active?/:latest?/:size?/:page?/:limit?",
    ktnPostsController.getPostsByCategory.bind(ktnPostsController)
  );
  /* GET posts content by email. */
  router.patch("/posts/:id", auth.auth.bind(auth), ktnPostsController.update.bind(ktnPostsController));
  router.delete("/posts/:id", auth.auth.bind(auth), ktnPostsController.delete.bind(ktnPostsController));

  return router;
};
