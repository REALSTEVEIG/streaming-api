module.exports = (express, container) => {
  const conn = require("./../../database/config/config");
  const router = express.Router();

  router.get("/total-transactions", async (req, res, next) => {
    const db = conn.client.db(conn.config.dbName).collection("transactions");

    try {
      const pipeline = [
        {
          $match: { status: "succeeded" }, // Only include documents with status "succeeded"
        },
        {
          $group: {
            _id: null,
            totalAmount: {
              $sum: { $toDouble: { $trim: { input: "$amount", chars: '"' } } },
            },
          },
        },
      ];

      const result = await db.aggregate(pipeline).toArray();

      if (result.length > 0) {
        const totalAmount = result[0].totalAmount;
        res.json({ totalAmount });
      } else {
        res.json({ totalAmount: 0 });
      }
    } catch (error) {
      console.error("Error calculating total amount:", error);
      res.status(500).json({ error: "Failed to calculate total amount" });
    }
  });

  return router;
};
