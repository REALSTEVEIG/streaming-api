const createUserCollection = async ({ client, config }) => {
    //await db.dropCollection("users");
    client.connect();
    const db = client.db(config.dbName, config.dbConfig);
    await db.createCollection("transactions", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["amount"],
          properties: {
            status: {
              bsonType: "string",
              description: "must be a string and is required",
            },
            amount: {
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
  