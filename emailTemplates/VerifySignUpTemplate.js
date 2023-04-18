const EmailBasicTemplate = require("./EmailBasicTemplate");
const EmailConstants = require("./EmailConstants");
const env = require("../config");

const content = `
    You have been registered for <a href="${env.FE_URL}"><strong>REHUBCY</strong></a>.
    <br>
    Please verify your email address by clicking <a href="${EmailConstants.url}" class="link">here</a>.
`;

const template = EmailBasicTemplate
  .replace(EmailConstants.emailPageTitle, "Email confirmation")
  .replace(EmailConstants.actionNameTitle, "Email Confirmation")
  .replace(EmailConstants.receiver, EmailConstants.user)
  .replace(EmailConstants.sender, env.MAIL_FROM_ADDRESS)
  .replace(EmailConstants.bodyContent, content);

module.exports = template;
