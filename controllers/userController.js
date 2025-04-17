const User = require("../models/UserModel");
const bcrypt = require("bcrypt");

// DONE
exports.signup = async (req, res) => {
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
    const userPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      ...req.body,
      password: userPassword,
    });
    return res.status(200).json({
      status: "success",
      data: user,
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
exports.checkUserLogin = async (req, res, next) => {
  // Getting The User
  const username = req.cookies.user;
  let user = await User.findOne({ username });

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
    res.cookie("user", req.user.username, { maxAge: 1000 * 60 * 60 * 24 * 5 }); // maxAge is 5 days

    return res.status(200).json({
      status: "success",
      data: "User created successfully",
    });
  } else {
    return res.status(401).json({
      status: "fail",
      data: "Authentication failed. Double-check your login details.",
    });
  }
};

// DONE
exports.getUser = async (req, res) => {
  const username = req.params.username;
  if (req.user === null) {
    return res.status(401).json({
      status: "fail",
      data: "You are not logged in",
    });
  }

  const user = await User.findOne({ username }).select("-password");

  if (!user) {
    return res.status(404).json({
      status: "fail",
      data: "User not found",
    });
  }

  return res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
};
