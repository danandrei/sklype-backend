const validate = require('mongoose-validator');

const emailValidators = [
  validate({
    validator: 'isEmail',
    arguments: [],
    message: 'user/email-invalid'
  })
];

const passwordValidators = [
  validate({
    validator: 'isLength',
    arguments: [4],
    message: 'user/password-invalid'
  })
];

module.exports = {
  passwordValidators,
  emailValidators,
};
