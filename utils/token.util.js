const jwt = require('jsonwebtoken');
const env = require("../config");

exports.generateToken = function(data, option) {
    const payload = { ...data };
    return jwt.sign(payload, env.JWT_PRIVATE_KEY, { ...option });
};

exports.decodeToken = async function(token) {
    return new Promise((resolve) => {
        jwt.verify(token, env.JWT_PRIVATE_KEY, async (err, decoded) => {
            if (err) {
                resolve(false);
                return;
            }
            resolve(decoded);
        });
    })
};
