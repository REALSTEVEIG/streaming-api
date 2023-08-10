module.exports = (express, container) => {
  const router = express.Router();
  const cartController = container.resolve("cartController");
  const auth = container.resolve("auth");
  /* POST group content. */
  router.post("/cart", auth.auth.bind(auth), cartController.create.bind(cartController));
  /* GET categories content by id. */
  router.get("/cart/:id", auth.auth.bind(auth), cartController.get.bind(cartController));
  /* GET categories content by id. */
  router.get("/cart/:user_id?/:cart_id?/:active?", auth.auth.bind(auth), cartController.getAll.bind(cartController));
  /* GET categories content by email. */
  router.patch("/cart/:id", auth.auth.bind(auth), cartController.update.bind(cartController));
  router.delete("/cart/:id", auth.auth.bind(auth), cartController.delete.bind(cartController));
  return router;
};
