const createUserCollection = async ({ client, config }) => {
  //await db.dropCollection("users");
  client.connect();
  const db = client.db(config.dbName, config.dbConfig);
  await db.createCollection("partners", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["title", "name"],
        properties: {
          title: {
            bsonType: "string",
            description: "name required.",
          },
          name: {
            bsonType: "string",
            description: "name required.",
          },
        },
      },
    },
  });
  client.close();
};

module.exports = createUserCollection;
