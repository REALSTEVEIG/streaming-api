const { MongoClient, ObjectId } = require("mongodb");

const connection = () => {
  const uri = process.env.DB_CONN;
  const client = new MongoClient(uri);
  try {
    client.connect();
    const config = {
      dbName: process.env.DB_NAME,
      id: ObjectId,
      dbConfig: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    };
    return { client, config };
  } catch (error) {
    console.log(error);
    //throw error;
  } finally {
    //client.close();
  }
};

module.exports = connection();
