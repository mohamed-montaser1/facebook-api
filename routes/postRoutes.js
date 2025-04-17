const express = require("express");
const router = express.Router();
const controllers = require("../controllers/postController");
const userControllers = require("../controllers/userController");

router.post("/create", userControllers.checkUserLogin, controllers.createPost);

module.exports = router;
