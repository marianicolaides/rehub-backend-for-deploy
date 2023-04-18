const EmailBasicTemplate = require('./EmailBasicTemplate');
const EmailConstants = require('./EmailConstants');
const env = require("../config");

const content = `
    Seems like you forgot your password for <strong>REHUBCY</strong>.
    <br>
    If it is so, please click <a href="${EmailConstants.url}" class="link">here</a> to reset your password.
`;

const template = EmailBasicTemplate
    .replace(EmailConstants.emailPageTitle, 'Forgot password')
    .replace(EmailConstants.actionNameTitle, 'Forgot Password')
    .replace(EmailConstants.receiver, EmailConstants.user)
    .replace(EmailConstants.sender, env.MAIL_FROM_ADDRESS)
    .replace(EmailConstants.bodyContent, content);

module.exports = template;
