const mongoose = require("mongoose");
const app = require("./app.js");
const port = 3000;
const dotenv = require("dotenv");
const express = require("express");

// IMAGES UPLOADS
const { upload } = require("./utils/imageStorage.js");

app.post("/api/v1/upload", upload.single("image"), (req, res) => {
  try {
    if (req.file.filename) {
      const imageURL = `http://localhost:${port}/images/${req.file.filename}`;
      return res.status(200).json({
        status: "success",
        imageURL,
      });
    } else {
      return res.status(400).json({
        status: "fail",
        message: "No image uploaded",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Something went wrong",
    });
  }
});

app.use("/images", express.static(`${__dirname}/uploads/images`));

// ENVIRONMENT VARIABLES
dotenv.config();

// DATABASE CONNECTION
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

// SERVER CONNECTION
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
