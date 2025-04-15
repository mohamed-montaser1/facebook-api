const mongoose = require("mongoose");

const emailRegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;

const validateEmail = (email) => emailRegExp.test(email);

const validateUsername = (username) => usernameRegex.test(username);

const userSchema = new mongoose.Schema({
  // the real name
  name: {
    type: String,
    required: [true, "name is required"],
  },
  // that will be in the profile link
  username: {
    type: String,
    required: [true, "username is required"],
    validate: [validateUsername, "Please fill a valid username"],
    unique: true,
  },
  birthday: {
    type: Date,
    required: [true, "birthday is required"],
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    required: [true, "gender is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validateEmail, "Please fill a valid email address"],
    match: [emailRegExp, "Please fill a valid email address"],
  },
  activatedEmail: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: [true, "password is required"],
    minLength: [8, "password must be at least 8 characters"],
  },
  friends: {
    type: [String],
    ref: "User",
    default: [],
  },
  posts: {
    type: [String],
    ref: "Post",
    default: [],
  },
  profilePicture: {
    type: String,
    default: "https://placehold.co/100",
  },
  coverPicture: {
    type: String,
    default: "https://placehold.co/1000x300",
  },
  phoneNumber: {
    type: String,
    default: "",
  },
  following: {
    type: [String],
    ref: "User",
    default: [],
  },
  followers: {
    type: [String],
    ref: "User",
    default: [],
  },
  images: {
    type: [String],
    default: [],
  },
});

userSchema.set("toJSON", {
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = doc._id;
    delete ret._id;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
