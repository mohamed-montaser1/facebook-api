const { isValidObjectId } = require("mongoose");
const { User, FriendRequest } = require("../models/UserModel");
const { requireLogin, acceptFriendRequestDirectly } = require("../utils/auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/emailsFunctionality");

// MIDDLEWARES
// DONE
exports.checkUserLogin = async (req, res, next) => {
  // Getting The User
  const userId = req.cookies.user;
  let user = await User.findById(userId);

  if (!user) {
    req.user = null;
    return next();
  }

  req.user = user;
  return next();
};

// DONE
exports.checkUserExist = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.user = null;
    return next();
  }

  req.user = user;
  return next();
};

// DONE
exports.checkFriendRequestExist = async (req, res, next) => {
  const { id } = req.params;
  const friendRequest = await FriendRequest.findById(id);
  if (!friendRequest) {
    return res.status(404).json({
      status: "fail",
      message: "Friend request not found",
    });
  }

  req.friendRequest = friendRequest;

  next();
};

// CONTROLLERS
// DONE
exports.signup = async (req, res) => {
  console.log({ user: req.user });
  if (req.user) {
    return res
      .status(400)
      .json({ status: "fail", message: "You are already logged in" });
  }

  const user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).json({
      status: "fail",
      message: "An account with this email already exists.",
    });
  }

  try {
    const { name, username, birthday, gender, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      username,
      birthday,
      gender,
      email,
      password: hashedPassword,
    });
    const { password: _, ...userData } = newUser.toObject();
    return res.status(200).json({
      status: "success",
      data: {
        user: userData,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
      error,
    });
  }
};

exports.verifyEmail = async (req, res) => {
  if (req.user) {
    return res.status(400).json({
      status: "fail",
      message: "You are already logged in",
    });
  }
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      status: "fail",
      message: "Email is required",
    });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "No user found with this email",
    });
  }
  if (user.isVerified) {
    return res.status(400).json({
      status: "fail",
      message: "Email already verified",
    });
  }
  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const mailOptions = {
    email,
    subject: "Verify your email",
    text: `Click the link to verify your email: ${link}`,
  };
  try {
    await sendEmail(mailOptions);
    return res.status(200).json({
      status: "success",
      message: "Email sent",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
      error,
    });
  }
};

exports.verifyEmailToken = async (req, res) => {
  const { token } = req.body;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findOne({ email: decoded.email });
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "No user found with this email",
    });
  }
  if (user.isVerified) {
    return res.status(400).json({
      status: "fail",
      message: "Email already verified",
    });
  }
  try {
    await User.findByIdAndUpdate(user.id, { isVerified: true });
    return res.status(200).json({
      status: "success",
      message: "Email verified",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
      error,
    });
  }
};

// DONE
exports.login = async (req, res) => {
  // USER DOESN'T EXIST
  if (req.user === null) {
    return res.status(404).json({
      status: "fail",
      data: "User doesn't exist",
    });
  }

  const isValidPassword = await bcrypt.compare(
    req.body.password,
    req.user.password
  );

  if (isValidPassword) {
    res.cookie("user", req.user.id, { maxAge: 1000 * 60 * 60 * 24 * 5 }); // maxAge is 5 days

    return res.status(200).json({
      status: "success",
      message: "User Logged In",
      data: { user: req.user },
    });
  } else {
    return res.status(401).json({
      status: "fail",
      message: "Authentication failed. Double-check your login details.",
      data: null,
    });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie("user");
  req.user = null;
  return res.status(200).json({
    status: "success",
    message: "logout done",
    data: null,
  });
};

exports.sendFriendRequest = async (req, res) => {
  if (requireLogin(req, res)) return;

  const { friendId } = req.body;
  if (!isValidObjectId(friendId)) {
    return res.status(400).json({
      status: "fail",
      data: "Invalid friendId",
    });
  }
  const friend = await User.findById(friendId);
  if (!friend) {
    return res.status(404).json({
      status: "fail",
      message: "Friend not found",
    });
  }

  if (friend.id === req.user.id) {
    return res.status(400).json({
      status: "fail",
      message: "You cannot send a friend request to yourself",
    });
  }

  // Already Friends
  if (friend.friends.includes(req.user.id)) {
    return res.status(400).json({
      status: "fail",
      message: "You are already friends",
    });
  }

  if (req.user.friends.includes(friendId)) {
    return res.status(400).json({
      status: "fail",
      message: "You are already friends",
    });
  }

  const requestExist = await FriendRequest.findOne({
    sender: req.user.id,
    receiver: friendId,
  });

  if (requestExist) {
    return res.status(400).json({
      status: "fail",
      message: "You have already sent a friend request",
    });
  }

  const reversedRequestExist = await FriendRequest.findOne({
    sender: friendId,
    receiver: req.user.id,
  });

  if (reversedRequestExist) {
    return acceptFriendRequestDirectly(res, reversedRequestExist);
  }

  try {
    const friendRequest = await FriendRequest.create({
      sender: req.user.id,
      receiver: friendId,
    });
    return res.status(201).json({
      status: "success",
      data: {
        friendRequest,
      },
      message: "friend request sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
      error,
    });
  }
};

// DONE
exports.acceptFriendRequest = async (req, res) => {
  if (requireLogin(req, res)) return;
  const { id: friendRequestId } = req.params;

  try {
    const friendRequest = req.friendRequest;

    // Add Receiver To The Sender Friend List
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.receiver },
    });
    // Add Sender To The Receiver Friend List
    await User.findByIdAndUpdate(friendRequest.receiver, {
      $addToSet: { friends: friendRequest.sender },
    });

    await FriendRequest.findByIdAndDelete(friendRequestId);

    return res.status(200).json({
      status: "success",
      message: "friend request accepted",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
      error,
    });
  }
};

// DONE
exports.rejectFriendRequest = async (req, res) => {
  if (requireLogin(req, res)) return;

  await req.friendRequest.deleteOne();

  return res.status(200).json({
    status: "success",
    data: null,
    message: "friend request rejected",
  });
};

exports.getFriends = async (req, res) => {
  if (requireLogin(req, res)) return;
  const user = await User.findById(req.user.id).populate(
    "friends",
    "-password"
  );

  return res.status(200).json({
    status: "success",
    data: {
      friends: user.friends,
    },
  });
};

exports.getFriendRequests = async (req, res) => {
  if (requireLogin(req, res)) return;

  try {
    const friendRequests = await FriendRequest.find({
      receiver: req.user._id,
    }).select("-receiver");
    return res.status(200).json({
      status: "success",
      message: `Friend Requests (${friendRequests.length})`,
      data: {
        friendRequests,
        count: friendRequests.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Error fetching friend requests",
      error,
    });
  }
};

// DONE
exports.followUser = async (req, res) => {
  if (requireLogin(req, res)) return;
  const target = req.params.id;
  const newFollower = req.user.id;

  if (!isValidObjectId(target)) {
    return res.status(400).json({
      status: "fail",
      message: "invalid target id",
    });
  }
  if (!isValidObjectId(newFollower)) {
    return res.status(400).json({
      status: "fail",
      message: "invalid newFollower id",
    });
  }

  const targetUser = await User.findById(target);
  if (!targetUser) {
    return res.status(404).json({
      status: "fail",
      message: "target user not found",
    });
  }
  if (targetUser.id === newFollower) {
    return res.status(400).json({
      status: "fail",
      message: "you cannot follow yourself",
    });
  }
  if (targetUser.followers.includes(newFollower)) {
    return res.status(400).json({
      status: "fail",
      message: "you are already following this user",
    });
  }
  await User.findByIdAndUpdate(target, {
    $addToSet: { followers: newFollower },
  });
  await User.findByIdAndUpdate(newFollower, {
    $addToSet: { following: target },
  });
  return res.status(200).json({
    status: "success",
    message: "you are now following this user",
  });
};

// DONE
exports.unfollowUser = async (req, res) => {
  if (requireLogin(req, res)) return;
  const target = req.params.id;
  const follower = req.user.id;
  if (!isValidObjectId(target)) {
    return res.status(400).json({
      status: "fail",
      message: "invalid target id",
    });
  }
  if (!isValidObjectId(follower)) {
    return res.status(400).json({
      status: "fail",
      message: "invalid follower id",
    });
  }
  const targetUser = await User.findById(target);
  if (!targetUser) {
    return res.status(404).json({
      status: "fail",
      message: "target user not found",
    });
  }
  if (targetUser.id === follower) {
    return res.status(400).json({
      status: "fail",
      message: "you cannot unfollow yourself",
    });
  }
  if (!targetUser.followers.includes(follower)) {
    return res.status(400).json({
      status: "fail",
      message: "you are not following this user",
    });
  }

  await User.findByIdAndUpdate(target, {
    $pull: { followers: follower },
  });
  await User.findByIdAndUpdate(follower, {
    $pull: { following: target },
  });
  return res.status(200).json({
    status: "success",
    message: "you are now unfollowing this user",
  });
};

// DONE
exports.updateProfileBasicInfo = async (req, res) => {
  if (requireLogin(req, res)) return;
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "user not found",
    });
  }
  const { name, profilePicture, coverPicture, phoneNumber, bio } = req.body;

  try {
    await User.findByIdAndUpdate(req.user.id, {
      $set: {
        name,
        profilePicture,
        coverPicture,
        phoneNumber,
        bio,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "profile updated",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
      error,
    });
  }
};

exports.updateUserName = async (req, res) => {
  if (requireLogin(req, res)) return;
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "user not found",
    });
  }
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({
      status: "fail",
      message: "username is required",
    });
  }
  if (username.length < 3) {
    return res.status(400).json({
      status: "fail",
      message: "username must be at least 3 characters long",
    });
  }
  if (username.length > 20) {
    return res.status(400).json({
      status: "fail",
      message: "username must be less than 20 characters long",
    });
  }
  const regex = /^[a-zA-Z0-9_]+$/;
  if (!regex.test(username)) {
    return res.status(400).json({
      status: "fail",
      message: "username can only contain letters, numbers and underscores",
    });
  }
  const usernameExist = await User.findOne({ username });
  if (usernameExist) {
    return res.status(400).json({
      status: "fail",
      message: "username already exists",
    });
  }
  await User.findByIdAndUpdate(req.user.id, {
    $set: {
      username,
    },
  });
  return res.status(200).json({
    status: "success",
    message: "username updated",
  });
};

exports.updatePassword = async (req, res) => {
  if (requireLogin(req, res)) return;
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "user not found",
    });
  }

  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      status: "fail",
      message: "old password and new password are required",
    });
  }
  const isValidPassword = await bcrypt.compare(oldPassword, user.password);
  if (!isValidPassword) {
    return res.status(400).json({
      status: "fail",
      message: "old password is incorrect",
    });
  }
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(req.user.id, {
    $set: {
      password: hashedNewPassword,
    },
  });
  return res.status(200).json({
    status: "success",
    message: "password updated",
  });
};

// In Progress
exports.explore = async (req, res) => {
  if (requireLogin(req, res)) return;
  const posts = await User.findById(req.user.id)
    .populate("friends")
    .populate("posts");
  return res.status(200).json({ status: "success", data: posts });
};
