module.exports = (express, container) => {
  const router = express.Router();
  const KtnAdvertisementsController = container.resolve("ktnAdvertisementsController");
  const auth = container.resolve("auth");
  /* POST group content. */
  router.post("/advertisement", auth.auth.bind(auth), KtnAdvertisementsController.create.bind(KtnAdvertisementsController));
  /* GET categories content by id. */
  router.get("/advertisement/:id", KtnAdvertisementsController.get.bind(KtnAdvertisementsController));
  /* GET categories content by id. */
  router.get("/advertisement/:size?/:page?/:limit?", KtnAdvertisementsController.getAll.bind(KtnAdvertisementsController));
  /* GET categories content by email. */
  router.patch("/advertisement/:id", auth.auth.bind(auth), KtnAdvertisementsController.update.bind(KtnAdvertisementsController));
  router.delete("/advertisement/:id", auth.auth.bind(auth), KtnAdvertisementsController.delete.bind(KtnAdvertisementsController));

  return router;
};
