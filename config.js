const { config } = require('dotenv');
config();

const {
    MONGO_URL,
    JWT_PRIVATE_KEY,
    FE_URL,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET_ID,
    MAIL_HOST,
    MAIL_PORT,
    MAIL_USERNAME,
    MAIL_PASSWORD,
    MAIL_FROM_NAME,
    MAIL_FROM_ADDRESS,
} = process.env;
const env = {
    MONGO_URL,
    JWT_PRIVATE_KEY,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET_ID,
    MAIL_HOST,
    MAIL_PORT,
    MAIL_USERNAME,
    MAIL_PASSWORD,
    MAIL_FROM_NAME,
    MAIL_FROM_ADDRESS,
    FE_URL: /\/$/.test(FE_URL) ? FE_URL : FE_URL + '/',
};

module.exports = env;
