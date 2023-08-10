module.exports = (express, container) => {
  const router = express.Router();

  const { ObjectId } = require("mongodb");
  const conn = require("../../database/config/config");
  
  module.exports = (express, container) => {
    const router = express.Router();

    router.post("/youtube_collection", async (req, res, next) => {
      try {
        const { client, config } = conn;
        const db = client.db(config.dbName);
        const collection = db.collection("youtube_streaming");
  
        // Your code to create a new document
        const document = {
          youtube_url: "youtube_url",
          title: "your_title",
          video_type: "video_type",
        };
        await collection.insertOne(document);
  
        res.status(200).json({ message: "Document created successfully" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred" });
      } finally {
        // Close the MongoDB client connection
        conn.client.close();
      }
    });

    router.post("/api/add-youtube-stream", async (req, res, next) => {
        try {
            const { title, youtube_url, video_type } = req.body;
    
            const db = conn.client.db(conn.config.dbName).collection("youtube_streaming");
    
            if(!title || !youtube_url || !video_type){
                return res.status(400).json({msg: "Please enter youtube url, title and video type"});
            }
    
            //push to db
            const result = await db.insertOne({title, youtube_url, video_type});
            console.log(result);
    
            res.status(201).json({msg : "Youtube Streaming Added", body : req.body})
    
        } catch (error) {
            console.error(error);
            return res.status(500).json({msg: "Server Error : ", error});
        }
    
      });

      router.get("/api/get-all-youtube-streams", async (req, res, next) => {
        try {
            const allYoutubeStreams = await (await conn.client.db(conn.config.dbName).collection("youtube_streaming").find().sort({_id: -1}).toArray())
    
            if (!allYoutubeStreams) {
                return res.status(400).json({msg: "No Youtube Streams Found"});
            }
    
            return res.status(200).json({msg: "All Youtube Streams", allYoutubeStreams});
        } catch (error) {
            console.error(error);
            return res.status(500).json({msg: "Server Error : ", error});
        }
    });
    
  
    router.get("/api/get-youtube-stream/:id", async (req, res, next) => {
      try {
        const { id } = req.params;
  
        // Basic validation using a regular expression
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
          return res.status(400).json({ msg: "No Youtube Stream Found" });
        }
  
        const db = conn.client.db(conn.config.dbName).collection("youtube_streaming");
        const youtubeStream = await db.findOne({ _id: ObjectId(id) });
  
        if (!youtubeStream) {
          return res.status(400).json({ msg: "No Youtube Stream Found" });
        }
  
        return res.status(200).json({ msg: "Youtube Stream", youtubeStream });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Server Error", error });
      }
    });

    //update

    router.put("/api/update-youtube-stream/:id", async (req, res, next) => {
      try {
        
        const { id } = req.params;

        const db = conn.client.db(conn.config.dbName).collection("youtube_streaming");

        const youtubeStream = await db.findOne({ _id: ObjectId(id) });

        if (!youtubeStream) {
          return res.status(400).json({ msg: "No Youtube Stream Found" });
        }

        const result = await db.updateOne({_id: ObjectId(id)}, {$set: {...req.body}});

        console.log(result);

        return res.status(200).json({msg: "Youtube Stream Updated", body: req.body});

      } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Server Error", error });
      }
    });

    //delete 

    router.delete("/api/delete-youtube-stream/:id", async (req, res, next) => {
      try {
        const { id } = req.params;

        const db = conn.client.db(conn.config.dbName).collection("youtube_streaming");

        const youtubeStream = await db.findOne({ _id: ObjectId(id) });

        if (!youtubeStream) {
          return res.status(400).json({ msg: "No Youtube Stream Found" });
        }

        const result = await db.deleteOne({_id: ObjectId(id)});

        console.log(result);

        return res.status(200).json({msg: "Youtube Stream Deleted"});

      } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Server Error", error });
      }
    });
  
    return router;
  };
  
  return router;
};


//CREATING A NEW COLLECTION IN MONGODB

