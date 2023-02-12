const jwt = require("jsonwebtoken");

const authorizedUser = (req, res, next) => {
  let token = req.headers["authorization"];
  if (!token)
    return res.status(400).json({ errorMessage: "Token is not provided" });

  try {
    let user = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    if(!user) return res.status(400).json({errorMessage : "User not found"})
    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({errorMessage : 'Invalid token' , error})
  }
};
module.exports.authorizedUser = authorizedUser;
