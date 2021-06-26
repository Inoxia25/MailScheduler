const express = require('express');
const app = express();
const session = require('express-session');
const mongoose = require("mongoose");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const  User = require("./models/user");
app.set('view engine', 'ejs');
const bodyParser = require("body-parser");

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));
//Connecting database
mongoose.connect(
  "mongodb+srv://chehak:123@cluster0.mahsn.mongodb.net/mailDB",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }
  );
  
  app.use(
    require("express-session")({
      secret: "!@#$%^&*()", 
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(bodyParser.urlencoded({
    extended: true
  }));
app.get('/', function(req, res) {
  res.render('login');
});

const port = process.env.PORT || 3000;
app.listen(port , () => console.log('App listening on port ' + port));
const passport = require('passport');
var userProfile;

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

app.get('/mail', (req, res) => res.send(userProfile)
//res.render("mail",{user:userProfile})
);
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

/*  Google AUTH  */
 
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = '519258044-gvqlh5aouugs489jbvv692t7inmbfoe8.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '-DgfDmLFycquojLoRCGTguHf';
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));
 
app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect('/mail');
  });

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
      new User({ username:req.body.username,mail:req.body.email}),
      req.body.password,
      function (err, user) {
        if (err) {
          console.log(err);
          return res.redirect("/");
        } 
        passport.authenticate("local")(req, res, function () {
            User={
                name:req.body.username,

            }
          res.render("mail",{user:User});
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