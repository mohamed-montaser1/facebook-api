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
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
  posts: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Post",
    default: [],
  },
  profilePicture: {
    type: String,
    default: "https://placehold.co/100?text=Profile%20Picture",
  },
  coverPicture: {
    type: String,
    default: "https://placehold.co/1000x300?text=Account%20Cover",
  },
  bio: {
    type: String,
    default: "",
  },
  phoneNumber: {
    type: String,
    default: "",
  },
  following: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
  followers: {
    type: [mongoose.Schema.Types.ObjectId],
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
  transform: function (_, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

const friendRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

friendRequestSchema.set("toJSON", {
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);

exports.User = User;

exports.FriendRequest = FriendRequest;
