const createSettingsCollection = async ({ client, config }) => {
  //await db.dropCollection("users");
  client.connect();
  const db = client.db(config.dbName, config.dbConfig);
  await db.createCollection("settings_categories", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["name"],
        properties: {
          status: {
            bsonType: "string",
            description: "must be a string and is required",
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

module.exports = createSettingsCollection;
