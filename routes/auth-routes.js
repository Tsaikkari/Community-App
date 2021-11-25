// routes/auth.routes.js
const mongoose = require("mongoose");
const { Router } = require("express");
const router = new Router();
const User = require("../models/User.model");
const multer = require("multer");
const moment = require("moment");

const upload = multer({ dest: "./public/uploads" });

const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");

router.get("/signup", isLoggedOut, (req, res) => res.render("auth/signup"));

router.get("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) next(err);
    res.redirect("/");
  });
});
//********************************************************************** */
const bcryptjs = require("bcryptjs");
const saltRounds = 10;
router.post("/signup", upload.single("photo"), async (req, res, next) => {
  console.log(req.body);
  const {
    username,
    email,
    password,
    isAdmin,
    isGroupCreator,
    dateOfBirth,
    gender,
  } = req.body;
  //console.log("xxxxxx",  moment(dateOfBirth).format('L')  );
  let shortDate = moment(dateOfBirth).format("L");
  const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

  // const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.render("auth/signup", {
      errorMessage: "Please provide your username, email and password.",
    });
    return;
  }
  //*************************************** */
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res.status(500).render("auth/signup", {
      errorMessage:
        "Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }
  //************************************** */
  bcryptjs
    .genSalt(saltRounds)
    .then((salt) => bcryptjs.hash(password, salt))
    .then((hashedPassword) => {
      return User.create({
        username: username,
        email: email,
        passwordHash: hashedPassword,
        gender: gender,
        dateOfBirth: shortDate,
        imagePath: imagePath,
      });
    })
    .then((userFromDB) => {
      console.log("Newly created user is: ", userFromDB);
      res.redirect("/userProfile");
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        // if (error.message.includes("is after maximum allowed value")) {
        //   res
        //     .status(500)
        //     .render("auth/signup", { errorMessage: "BirthDate should be before 2000" });
        // } else
        res.status(500).render("auth/signup", { errorMessage: error.message });
      } else if (error.code === 11000) {
        res.status(500).render("auth/signup", {
          errorMessage:
            "Username and email need to be unique. Either username or email is already used.",
        });
      } else {
        next(error);
      }
    });
});
//********************************************* */
router.get("/login", (req, res) => {
  req.app.locals.title = "login  Profile";
  res.render("auth/login");
});
//********************************************* */
router.post("/login", (req, res, next) => {
  console.log("SESSION =====> ", req.session);
  const { email, password } = req.body;

  if (email === "" || password === "") {
    res.render("auth/login", {
      errorMessage: "Please enter both, email and password to login.",
    });
    return;
  }
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        res.render("auth/login", {
          errorMessage: "Email is not registered. Try with other email.",
        });
        return;
      } else if (bcryptjs.compareSync(password, user.passwordHash)) {
        req.session.currentUser = user;
        res.redirect("/userProfile");
      } else {
        res.render("auth/login", { errorMessage: "Incorrect password." });
      }
    })

    .catch((error) => next(error));
});

router.get("/userProfile", isLoggedIn, (req, res) => {
  req.app.locals.title = "user Profile";
  User.findById(req.session.currentUser)
    .populate("gMember")
    .then((userInSession) =>
      res.render("users/user-profile", { userInSession })
    );
});
//*********************************************** */
module.exports = router;
