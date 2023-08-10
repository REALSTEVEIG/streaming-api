const createStreamCredentialsCollection = async ({ client, config }) => {
  //await db.dropCollection("users");
  client.connect();
  const db = client.db(config.dbName, config.dbConfig);
  await db.createCollection("stream_credentials", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["post_id", "status"],
        properties: {
          status: {
            bsonType: "string",
            description: "must be a string and is required",
          },
          post_id: {
            bsonType: "string",
            description: "credentials has not post associated with it. Required.",
          },
        },
      },
    },
  });
  client.close();
};

module.exports = createStreamCredentialsCollection;
