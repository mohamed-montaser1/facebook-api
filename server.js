const mongoose = require("mongoose");
const app = require("./app.js");
const port = 3000;
const dotenv = require("dotenv");
dotenv.config();
const URI = process.env.DB_CONNECTION_URI.replace(
  "<DB_PASSWORD>",
  process.env.DB_PASSWORD
);

mongoose
  .connect(URI)
  .then(() => {
    console.log("DB Connected Successfully");
  })
  .catch((err) => {
    console.error("Error occurred while connecting to db: ", err);
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
