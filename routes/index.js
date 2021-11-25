const router = require("express").Router();

/* GET home page */
router.get("/", (req, res, next) => {
  req.app.locals.title = "GetToGether";
  res.render("index");
});

module.exports = router;
