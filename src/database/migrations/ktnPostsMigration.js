const createKtnPostCollection = async ({ client, config }) => {
  //await db.dropCollection("users");
  client.connect();
  const db = client.db(config.dbName, config.dbConfig);
  await db.createCollection("ktn_posts", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["title", "status"],
        properties: {
          status: {
            bsonType: "string",
            description: "must be a string and is required",
          },
          title: {
            bsonType: "string",
            description: "title required and must be a string.",
          },
        },
      },
    },
  });
  client.close();
};

module.exports = createKtnPostCollection;
