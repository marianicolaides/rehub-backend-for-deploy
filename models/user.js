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

userSchema.pre(['findByIdAndUpdate', 'save'], async function (next) {
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
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
