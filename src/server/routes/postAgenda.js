module.exports = (express, container) => {
  const router = express.Router();
  const postAgendaController = container.resolve("postAgendaController");
  const auth = container.resolve("auth");
  /* POST group content. */
  router.post("/post-agenda", auth.auth.bind(auth), postAgendaController.create.bind(postAgendaController));
  /* GET posts content by id. */
  router.get("/post-agenda/:id", postAgendaController.get.bind(postAgendaController));
  /* GET posts content by id. */
  router.get("/post-agenda/:post_id?", postAgendaController.getAll.bind(postAgendaController));
  /* GET posts content by email. */
  router.patch("/post-agenda/:id", auth.auth.bind(auth), postAgendaController.update.bind(postAgendaController));
  router.delete("/post-agenda/:id", auth.auth.bind(auth), postAgendaController.delete.bind(postAgendaController));

  return router;
};
