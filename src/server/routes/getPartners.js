const { ObjectId } = require("mongodb");
const nodemailer = require("nodemailer");

module.exports = (express, container) => {
    const conn = require("./../../database/config/config");
    const router = express.Router();

    router.get("/all_subscribers", async (req, res, next) => {
        const db = conn.client.db(conn.config.dbName).collection("cart_items");
        const result = await db.find({ partnership_id: { $ne: null }}).toArray();

        const total_subscribers = result.length;

        res.json({
            total: total_subscribers,
            result
        });
    });

    return router;
};

// module.exports = (express, container) => {
//     const conn = require("./../../database/config/config");
//     const router = express.Router();

//     router.get("/all_subscribers", async (req, res, next) => {
//         const db = conn.client.db(conn.config.dbName).collection("carts");
//         const result = await db.find({ status : "Paid" }).toArray();
        
//         const total_subscribers = result.length;

//         res.json({
//             total: total_subscribers,
//             result
//         });
//     });

//     return router;
// };
