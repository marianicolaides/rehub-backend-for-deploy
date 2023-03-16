const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema(
  {
    accountType: {
      type: String,
      enum: ["Professional", "Host"],
    },
    signInType: {
      type: String,
      enum: ["App", "Google", "Facebook"],
      // default: "App",
    },
    username: String,
    password: String,
    email: String,
    image: String,
    uniqueId:String,
   
  },
  {
    timestamps: true,
  }
);

userSchema.pre(['findOneAndUpdate'], async function (next) {
  ["email", "password"].forEach((key) => {
    if (!this._update[key]) {
      delete this._update[key];
    }
  });
  if (this._update.password) {
    const encryptedPassword = await bcrypt.hash(this._update.password, 10);
    this._update.password = encryptedPassword;
  }

  next();
});

userSchema.method("encryptPassword", async (password) => {
  let encryptPassword = await bcrypt.hash(password, 10);
  return encryptPassword;
});
userSchema.method("comparePassword", async (password, hashPassword) => {
  let isEqual = await bcrypt.compare(password, hashPassword);
  return isEqual;
});

const User = mongoose.model("user", userSchema);

module.exports.User = User;
