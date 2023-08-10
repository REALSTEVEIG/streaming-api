module.exports = (express, container) => {
  const router = express.Router();
  const postScheduleController = container.resolve("postScheduleController");
  const auth = container.resolve("auth");
  /* POST group content. */
  router.post("/post-schedule", auth.auth.bind(auth), postScheduleController.create.bind(postScheduleController));
  /* GET posts content by id. */
  router.get("/post-schedule/:id", postScheduleController.get.bind(postScheduleController));
  /* GET posts content by id. */
  router.get("/post-schedule/:post_id?", postScheduleController.getAll.bind(postScheduleController));
  /* GET posts content by email. */
  router.patch("/post-schedule/:id", auth.auth.bind(auth), postScheduleController.update.bind(postScheduleController));
  router.delete("/post-schedule/:id", auth.auth.bind(auth), postScheduleController.delete.bind(postScheduleController));
  return router;
};
