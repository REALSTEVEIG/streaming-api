const { ObjectId } = require("mongodb");
module.exports = (express, container) => {
    const conn = require("./../../database/config/config");
    const router = express.Router();
    router.get("/cart-qaunt/:id/:qty", async (req, res, next)=>{
        const {qty, id} = req.params;
        //update qty
        const db = conn.client.db(conn.config.dbName).collection("cart_items");
        if(qty && id){
            //push to cart
            const result = await db.updateOne({_id: ObjectId(id)}, {$set: {quantity: parseInt(qty)}}, { upsert: true });
            console.log(result);
            //console.log(id);
        }
        res.json(req.params) 
    });
    return router;
  };
  