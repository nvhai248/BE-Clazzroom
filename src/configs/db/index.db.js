const mongoose = require("mongoose");

async function connect() {
  try {
    let connectionString = process.env.CONNECTION_STRING
    console.log(connectionString);
    mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const connection = mongoose.connection;
    connection.on("error", console.error.bind(console, "connection error:"));
    connection.once("open", function () {
      // we're connected!
      console.log("Connected to MongoDB Atlas");
    });
  } catch (e) {
    console.log(e);
  }
}

module.exports = { connect };
