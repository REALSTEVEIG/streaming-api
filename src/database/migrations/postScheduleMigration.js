const { ObjectId } = require("mongodb");

const createPostScheduleCollection = async ({ client, config }) => {
  //await db.dropCollection("users");
  client.connect();
  const db = client.db(config.dbName, config.dbConfig);
  await db.createCollection("post_schedules", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["status", "post_id"],
        properties: {
          post_id: {
            bsonType: "objectId",
            description: "Post ID is required",
          },
        },
      },
    },
  });
  client.close();
};

module.exports = createPostScheduleCollection;
