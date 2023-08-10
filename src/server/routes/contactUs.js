module.exports = (express, container) => {
  const router = express.Router();
  const ContactUsController = container.resolve("contactUsController");
  const auth = container.resolve("auth");
  /* POST group content. */
  router.post("/contact-us", auth.auth.bind(auth), ContactUsController.create.bind(ContactUsController));
  /* GET contact us content by id. */
  router.get("/contact-us/:id", ContactUsController.get.bind(ContactUsController));
  /* GET contact us content by id. */
  router.get("/contact-us", ContactUsController.getAll.bind(ContactUsController));
  /* GET contact us content by email. */
  router.patch("/contact-us/:id", auth.auth.bind(auth), ContactUsController.update.bind(ContactUsController));
  /**Delete contact us */
  router.delete("/contact-us/:id", auth.auth.bind(auth), ContactUsController.delete.bind(ContactUsController));
  return router;
};
