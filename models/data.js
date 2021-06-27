const mongoose = require("mongoose");

const ScheduleMailSchema = mongoose.Schema({
    to: String,
    cc: String,
    subject: String,
    mailbody: String,
    scheduletype: String,
    date: String,
    time: String
});
const HistoryMailSchema = mongoose.Schema({
    to: String,
    cc: String,
    subject: String,
    mailbody: String,
    scheduletype: String,
    sentdate: String,
    senttime: String
});

const MailSchema = new mongoose.Schema({
  username: String,
  password: String,
  schedule: [ScheduleMailSchema],
  history: [HistoryMailSchema]
});


module.exports = mongoose.model("Mail", MailSchema);
