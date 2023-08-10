const { ObjectId } = require("mongodb");

const createAgendaCollection = async ({ client, config }) => {
  //await db.dropCollection("users");
  client.connect();
  const db = client.db(config.dbName, config.dbConfig);
  await db.createCollection("post_schedules", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["post_id"],
        properties: {
          post_id: {
            bsonType: "object",
            description: "Post ID is required",
          },
        },
      },
    },
  });
  client.close();
};

module.exports = createAgendaCollection;
