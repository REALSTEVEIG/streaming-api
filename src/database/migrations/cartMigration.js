const createCartCollection = async ({ client, config }) => {
  //await db.dropCollection("users");
  client.connect();
  const db = client.db(config.dbName, config.dbConfig);
  await db.createCollection("carts", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["status", "user_id"],
        properties: {
          status: {
            bsonType: "string",
            description: "must be a string and is required",
          },
          user_id: {
            bsonType: "string",
            description: "must be a string and is required",
          },
        },
      },
    },
  });
  client.close();
};

module.exports = createCartCollection;
