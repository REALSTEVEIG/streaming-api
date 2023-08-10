const createUserCollection = async ({ client, config }) => {
  //await db.dropCollection("users");
  client.connect();
  const db = client.db(config.dbName, config.dbConfig);
  await db.createCollection("users", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["status", "email"],
        properties: {
          status: {
            bsonType: "string",
            description: "must be a string and is required",
          },
          email: {
            bsonType: "string",
            description: "must be a string and is required",
          },
        },
      },
    },
  });
  client.close();
};

module.exports = createUserCollection;
