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

// implement passport
require("./configs/passport").setup(app);
//implement routers
require("./routers/index.router")(app);

app.use((err, req, res, next) => {
  res
    .status(500)
    .json({ statusCode: 500, type: "Internal Server!", message: err.message });
});

app.listen(port, () => {
  console.log("listening on port", port);
});
