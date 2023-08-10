const { client } = require("../config/config");

const createUserTokenCollection = async ({ client, config }) => {
  //await db.dropCollection("users");
  client.connect();
  const db = client.db(config.dbName, config.dbConfig);
  await db.createCollection("user_tokens", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["user_id", "status"],
        properties: {
          user_id: {
            bsonType: "string",
            description: "must be a string and is required",
          },
          status: {
            bsonType: "string",
            description: "must be a string and is required",
          },
        },
      },
    },
  });
  client.close();
};

module.exports = createUserTokenCollection;
