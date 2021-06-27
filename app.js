const express = require("express");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
const LocalStrategy = require("passport-local");
let cron = require("node-cron");
let nodemailer = require("nodemailer");
const passportLocalMongoose = require("passport-local-mongoose");
const User = require("./models/user");
const Mail = require("./models/mail");
app.set("view engine", "ejs");
//const  User = require("./models/user");
const Maildata = require("./models/data");
app.set('view engine', 'ejs');
const bodyParser = require("body-parser");
const schedule = require("node-schedule");
var password;
var username;
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "SECRET",
  })
);
//Connecting database
mongoose.connect("mongodb+srv://chehak:123@cluster0.mahsn.mongodb.net/mailDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
app.get('/home',(req,res,next) =>{
  //Here fetch data using mongoose query like
  Maildata.findOne({username: 'Username here'}, function(err, users) {
  if (err) throw err;
  // object of all the users
  res.render('home',{users:users.schedule});
})
});
app.get('/history',(req,res,next) =>{
  //Here fetch data using mongoose query like
  Maildata.findOne({username: 'Username here'}, function(err, users) {
  if (err) throw err;
  // object of all the users
  res.render('history',{users:users.history});
})
});
app.get('/mail', function(req, res) {
  res.render('mail',{user:userProfile});
});


app.use(
  require("express-session")({
    secret: "!@#$%^&*()",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.get("/", function (req, res) {
  res.render("login");
});

app.post("/mail/:email", function (req, res) {
  //res.send(req.body);
  to = req.body.to;
  cc = req.body.cc;
  subject = req.body.subject;
  body = req.body.body;
  console.log("🚀 ~ file: app.js ~ line 74 ~  body",  body)
  scheduletype = req.body.scheduletype;
  t = req.body.time;
  date = req.body.date;
  day = req.body.day;
  console.log(password);
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: req.params.email,
      pass:password, //PASSWORD ADDED
      //pass: ",
    },
  });

  var mailOptions = {
    from: req.params.email,
    to: to + "," + cc,
    subject: subject,
    text: body,
  };
  var c = "";
  var hour = "";
  var minute = "";

  if (scheduletype == "recuring") {
    c = "*/10 * * * * *";
  } else {
    var time;
    if (t[0].length != 0) time = t[0];
    else if (t[1].length != 0) time = t[1];
    else time = t[2];
    var l = time.length;
    var i = 0;
    while (time[i] != ":") {
      hour = hour + time[i];
      i++;
    }
    i++;
    while (i < l) {
      minute = minute + time[i];
      i++;
    }
    //console.log("hour" + hour);
    //console.log( "minute" + minute);
    if (scheduletype == "weekly") {
      //8 am every monday
      //c='0 8 * * 1';
      //console.log("week");
      c = minute + " " + hour + " * * " + day;
    } else if (scheduletype == "monthly") {
      //21st of ervery month;
      //c='* * 21 * *'
      //console.log("month");
      var d = date[0];
      var l = d.length;
      var ndate = d[l - 2] + d[l - 1];
      c = minute + " " + hour + " " + ndate + " * * ";
      //console.log(c);
    } else if (scheduletype == "yearly") {
      //console.log("year");
      var d = date[1];
      var l = d.length;
      var ndate = d[l - 2] + d[l - 1];
      ndate = parseInt(ndate);
      var nmnth = d[l - 5] + d[l - 4];
      nmth = parseInt(nmnth);
      nmnth = nmnth - 1;
      console.log("year  " + ndate);
      console.log(nmnth);
      const job = schedule.scheduleJob(
        { hour: hour, minute: minute, date: ndate, month: nmnth },
        function () {
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);

            }
          });
          console.log("cron is running at ");
        }
      );
      //c='* * * * *';
    }
  }
  if (scheduletype != "yearly") {
    cron.schedule(c, () => {
      // Send e-mail
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
      console.log("cron is running at " + c);
    });
  }
  //posting mail to db
  User.findOne({ mail: req.params.email }, function (err, found) {
    if (err) {
      console.log(err);
      res.redirect("mail");
    }
    //create new comments
    else {
      console.log(found);
      var mail = {
        mailto: to,
        mailcc: cc,
        subject: subject,
        body: body,
        schedule: scheduletype,
        // time: t,
        // date: date,
        // day: day,
      };
      console.log("🚀 ~ file: app.js ~ line 167 ~ mail", mail)
      Mail.create(mail, function (err, newMail) {
        console.log("🚀 ~ file: app.js ~ line 169 ~ newMail", newMail)
        if (err) {
          console.log(err);
          res.redirect("back");
        } else {
          newMail.save();
          //add mail to user
          if(found.mail==undefined)
          found.mails=[newMail];
          else
          found.mails.push(newMail)

          //save user
          found.save();
          //redirect to campground show page
          res.render("home",{users:userProfile});
        }
      });
    }
  });
});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("App listening on port " + port));
const passport = require("passport");
var userProfile;

app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");

app.get(
  "/mail",
  (
    req,
    res //res.send(userProfile)
  ) => res.render("mail", { user: userProfile })
);
app.get("/error", (req, res) => res.send("error logging in"));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

/*  Google AUTH  */

const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const GOOGLE_CLIENT_ID =
  "519258044-gvqlh5aouugs489jbvv692t7inmbfoe8.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "-DgfDmLFycquojLoRCGTguHf";
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      userProfile = profile;
      return done(null, userProfile);
    }
  )
);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/error" }),
  function (req, res) {
    // Successful authentication, redirect success.
    //storing in db after google sign in
    User.find({ mail: userProfile.emails[0].value }, function (err, found) {
      if (err) {
        console.log(err);
      } else {
        if (found == []) {
          //if not present in db, then store it
          User.register(
            new User({
              username: userProfile.name.givenName,
              mail: userProfile.emails[0].value,
            }),
            userProfile.id,
            function (err, user) {
              if (err) {
          console.log("🚀 ~ file: app.js ~ line 260 ~ newMail", newMail)
          console.log("🚀 ~ file: app.js ~ line 260 ~ newMail", newMail)
                console.log(err);
                return res.redirect("/");
              }
              passport.authenticate("local")(req, res, function () {});
            }
          );
        }
      }
    });

    res.redirect("/mail");
  }
);

/** passport authenticate */
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));
app.use(passport.initialize());
app.use(passport.session());

//AUTH ROUTES
//show register form
/*app.get("/register", (req, res) => {
    res.redirect("/");
  });*/
//handle sign up logic
app.post("/register", function (req, res) {
  console.log(req.body);
  password=req.body.password;
  username=req.body.username;
  User.register(
    new User({ username: req.body.username, mail: req.body.email }),
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        return res.redirect("/");
      }
      passport.authenticate("local")(req, res, function () {
        var Userobj = {
          name: {
            givenName: req.body.username,
          },
          emails: [{ value: req.body.email }],
        };
        res.render("mail", { user: Userobj });
      });
    }
  );
});

//show login form
app.get("/login", function (req, res) {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  }),
  function (req, res) {password=req.body.password; username=req.body.username;}
);
//LOGOUT
app.get("/logout", function (req, res) {
  req.logout();
  //req.flash("success","Logged You out");
  res.redirect("/");
});
