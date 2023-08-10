const createSettingsCollection = async ({ client, config }) => {
  //await db.dropCollection("users");
  client.connect();
  const db = client.db(config.dbName, config.dbConfig);
  await db.createCollection("settings", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["category_id"],
        properties: {
          status: {
            bsonType: "string",
            description: "must be a string and is required",
          },
          category_id: {
            bsonType: "string",
            description: "name required.",
          },
        },
      },
    },
  });
  client.close();
};

module.exports = createSettingsCollection;
