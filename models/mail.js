var mongoose=require("mongoose");
var mailSchema=new mongoose.Schema({
	author: {id: { type: mongoose.Schema.Types.ObjectId,
				 ref:"User"},username:String}, 
                 mailfrom:String,
    mailto:String,
    mailcc:String,
    subject:String,
    body:String,
	schedule: String,
time:String,
date:String,
day:String});
module.exports= mongoose.model("Mails",mailSchema); 