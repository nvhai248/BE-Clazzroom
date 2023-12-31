const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 3001;

// connect to db
require("./configs/db/index.db").connect();

app.use(cors());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// Make sure form data and file submissions are processed
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.json());

app.use((err, req, res, next) => {
  if (err instanceof TypeError || err instanceof ReferenceError) {
    return res.status(400).json({
      statusCode: 400,
      type: "Bad Request",
      message:
        "Your request resulted in a bad request due to a server-side error.",
    });
  }
  next(err);
});

app.use((err, req, res, next) => {
  res.status(500).json({
    statusCode: 500,
    type: "Internal Server Error",
    message: "An unexpected error occurred on the server.",
  });
});


// implement passport
require("./configs/passport").setup(app);
//implement routers
require("./routers/index.router")(app);

app.listen(port, () => {
  console.log("listening on port", port);
});
