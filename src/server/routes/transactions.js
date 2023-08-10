module.exports = (express, container) => {
  const router = express.Router();
  const transactionsController = container.resolve("transactionsController");
  const auth = container.resolve("auth");
  /**POST initiate payment */
  router.post("/initiate-payment", transactionsController.createPaymentIntent.bind(transactionsController));
  /* POST group content. */
  router.post("/partnership-payments", auth.auth.bind(auth), transactionsController.create.bind(transactionsController));
  /* GET transactions content by id. */
  router.get("/partnership-payments/:id", auth.auth.bind(auth), transactionsController.get.bind(transactionsController));
  /* GET transactions content by id. */
  router.get(
    "/partnership-payments/:user_id?/:transaction_reference?/:partnership_id?/:size?/:page?/:limit?",
    auth.auth.bind(auth),
    transactionsController.getAll.bind(transactionsController)
  );
  /* GET transactions content by id. */
  router.get(
    "/partnership-subscriptions/:user_id/:size?/:page?/:limit?",
    auth.auth.bind(auth),
    transactionsController.getUserPartnershipSubscriptions.bind(transactionsController)
  );
  /* GET transactions content by email. */
  router.patch("/partnership-payments/:id", auth.auth.bind(auth), transactionsController.update.bind(transactionsController));
  router.delete("/partnership-payments/:id", auth.auth.bind(auth), transactionsController.delete.bind(transactionsController));

  return router;
};
