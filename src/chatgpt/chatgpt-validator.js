const { body } = require("express-validator");

// body()
const validateChatGPTBody = () => {
  return [body("id", "id nao existe").exists()];
};

module.exports = {
  validateChatGPTBody,
};
// exports.validate = (method) => {
//   switch (method) {
//     case 'createUser': {
//      return [
//         body('userName', 'userName doesnt exists').exists(),
//         body('email', 'Invalid email').exists().isEmail(),
//         body('phone').optional().isInt(),
//         body('status').optional().isIn(['enabled', 'disabled'])
//        ]
//     }
//   }
// }
