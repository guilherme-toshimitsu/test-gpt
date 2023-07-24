const admin = require("firebase-admin");
var serviceAccount = require("../../wetrek-151fc-firebase-adminsdk-74k13-a5d131a3b0.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
module.exports = admin;
