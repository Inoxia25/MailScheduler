const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  mail: String,
  mails: [{
    type: mongoose.Schema.Types.ObjectId, //embedding the reference to ids of mail
    ref: "Mail" //the model name
  }]
});
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);