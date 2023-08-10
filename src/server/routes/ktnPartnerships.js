module.exports = (express, container) => {
  const router = express.Router();
  const ktnPartnershipsController = container.resolve("ktnPartnershipsController");
  const auth = container.resolve("auth");
  /* POST group content. */
  router.post("/partnerships", auth.auth.bind(auth), ktnPartnershipsController.create.bind(ktnPartnershipsController));
  /* GET partnership content by id. */
  router.get("/partnerships/:id", ktnPartnershipsController.get.bind(ktnPartnershipsController));
  /* GET partnership content by id. */
  router.get("/partnerships", ktnPartnershipsController.getAll.bind(ktnPartnershipsController));
  /* GET partnership content by email. */
  router.patch("/partnerships/:id", auth.auth.bind(auth), ktnPartnershipsController.update.bind(ktnPartnershipsController));
  router.delete("/partnerships/:id", auth.auth.bind(auth), ktnPartnershipsController.delete.bind(ktnPartnershipsController));
  return router;
};
