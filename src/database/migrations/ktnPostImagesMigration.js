const createUserCollection = async ({ client, config }) => {
  //await db.dropCollection("users");
  client.connect();
  const db = client.db(config.dbName, config.dbConfig);
  await db.createCollection("ktn_post_images", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["post_id"],
        properties: {
          post_id: {
            bsonType: "string",
            description: "Post ID required.",
          },
        },
      },
    },
  });
  client.close();
};

module.exports = createUserCollection;
