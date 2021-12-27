require('dotenv/config')
require('./db')
const express = require('express')
const hbs = require('hbs')

const app = express()

hbs.registerPartials(__dirname + '/views/partials/')

// ℹ️ This function is getting exported from the config folder. It runs most middlewares
require('./config')(app)

// default value for title local
const projectName = 'lab-express-basic-auth'
const capitalized = (string) =>
  string[0].toUpperCase() + string.slice(1).toLowerCase()

app.locals.title = `${capitalized(projectName)}- Generated with Ironlauncher`

// session config
const session = require('express-session')
const MongoStore = require('connect-mongo')

const DB_URL = process.env.MONGODB_URI

app.use(
  session({
    secret: process.env.SESS_SECRET,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: DB_URL,
    }),
  })
)
app.use(function (req, res, next) {
  res.locals.session = req.session
  next()
})

// 👇 Start handling routes here
const index = require('./routes/index')
const authRouter = require('./routes/auth-routes')
const groupRouter = require('./routes/group-routes')

app.use('/', index)
app.use('/', authRouter)
app.use('/', groupRouter)

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require('./error-handling')(app)

module.exports = app

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require('./error-handling')(app)

module.exports = app
