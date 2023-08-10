module.exports = (express, container) => {
  const router = express.Router();
  const cartItemController = container.resolve("cartItemController");
  const auth = container.resolve("auth");
  /* POST group content. */
  /* GET categories content by id. */
  router.get("/cart-items/:id", auth.auth.bind(auth), cartItemController.get.bind(cartItemController));
  /* GET categories content by id. */
  router.get("/cart-items/:partnership_id?/:cart_id?", auth.auth.bind(auth), cartItemController.getAll.bind(cartItemController));
  /* GET categories content by email. */
  router.patch("/cart-items/:id", auth.auth.bind(auth), cartItemController.update.bind(cartItemController));
  router.delete("/cart-items/:id", auth.auth.bind(auth), cartItemController.delete.bind(cartItemController));
  return router;
};
