const express = require("express");
const app = express();
const userRoutes = require("./routes/userRoutes");
const cookieParser = require("cookie-parser")

app.use(express.json());
app.use(cookieParser())

app.use("/api/v1/user", userRoutes);

module.exports = app;
