const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user", "creator"],
      default: "user",
    },
    approved: {
      type: Boolean,
      default: false, // new users are not approved by default
    },
      provider : {
        type: String,
        default: "local"
      },    
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
