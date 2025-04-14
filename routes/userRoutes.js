const express = require("express");
const router = express.Router();
const controllers = require("../controllers/userController");
router.post("/signup", controllers.checkUserLogin, controllers.signup);
router.get("/login", controllers.checkUserExist, controllers.login);
router.get("/:username", controllers.checkUserLogin, controllers.getUser);
// router.post("/:id/posts");

module.exports = router;
