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
const bodyParser = require("body-parser");
const schedule = require("node-schedule");

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
  res.send(req.body);
  to = req.body.to;
  cc = req.body.cc;
  subject = req.body.subject;
  mailbody = req.body.mailbody;
  scheduletype = req.body.scheduletype;
  t = req.body.time;
  date = req.body.date;
  day = req.body.day;
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "nandini.jain..cd.eee19@itbhu.ac.in",
      pass: "nandini123", //PASSWORD ADDED
      //pass: "####INSERTYOURPASSWORDHERE####",
    },
  });

  var mailOptions = {
    from: "nandini.jain..cd.eee19@itbhu.ac.in",
    to: to + "," + cc,
    subject: subject,
    text: mailbody,
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
  User.find({ mail: req.params.email }, function (err, found) {
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
        body: mailbody,
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
          found.mails[0]=newMail;
          else
          found.mails.push(newMail);
          //save user
          found.save();
          //redirect to campground show page
          res.redirect("/mail");
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
  User.register(
    new User({ username: req.body.username, mail: req.body.email }),
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        return res.redirect("/");
      }
      passport.authenticate("local")(req, res, function () {
        User = {
          name: {
            givenName: req.body.username,
          },
          emails: [{ value: req.body.email }],
        };
        res.render("mail", { user: User });
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
  function (req, res) {}
);
//LOGOUT
app.get("/logout", function (req, res) {
  req.logout();
  //req.flash("success","Logged You out");
  res.redirect("/");
});
