const express = require("express");
const router = express.Router();
const controllers = require("../controllers/userController");
const { default: rateLimit } = require("express-rate-limit");
const { getUser } = require("../utils/userUtility");

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 login requests per minute
  message: "Too many login attempts. Please try again in a minute.",
});

router.post("/signup", controllers.checkUserLogin, controllers.signup);
router.get(
  "/login",
  loginLimiter,
  controllers.checkUserExist,
  controllers.login
);
router.post(
  "/logout",
  loginLimiter,
  controllers.checkUserLogin,
  controllers.logout
);

router.get("/explore", controllers.checkUserLogin, controllers.explore);
router.get(
  "/u/:username",
  // 30 requests per minute
  rateLimit({
    windowMs: 1000 * 60 * 3, // 3 minutes
    max: 30,
  }),
  controllers.checkUserLogin,
  getUser
);
router
  .route("/friends")
  .get(controllers.checkUserLogin, controllers.getFriends);

router.post(
  "/friend-requests",
  controllers.checkUserLogin,
  controllers.sendFriendRequest
);

router.post(
  "/friend-requests/:id/accept",
  controllers.checkUserLogin,
  controllers.checkFriendRequestExist,
  controllers.acceptFriendRequest
);

router.post(
  "/friend-requests/:id/reject",
  controllers.checkUserLogin,
  controllers.checkFriendRequestExist,
  controllers.rejectFriendRequest
);

router.get(
  "/friend-requests",
  controllers.checkUserLogin,
  controllers.getFriendRequests
);

router.post("/follow/:id", controllers.checkUserLogin, controllers.followUser);
router.post(
  "/unfollow/:id",
  controllers.checkUserLogin,
  controllers.unfollowUser
);

module.exports = router;
