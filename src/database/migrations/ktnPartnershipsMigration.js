const createUserCollection = async ({ client, config }) => {
  //await db.dropCollection("users");
  client.connect();
  const db = client.db(config.dbName, config.dbConfig);
  await db.createCollection("ktn_partnerships", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["name", "status", "amount"],
        properties: {
          status: {
            bsonType: "string",
            description: "must be a string and is required",
          },
          name: {
            bsonType: "string",
            description: "name required.",
          },
          amount: {
            bsonType: "number",
            description: "name required.",
          },
        },
      },
    },
  });
  client.close();
};

module.exports = createUserCollection;
