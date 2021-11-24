const admin = (req, res, next) => {
  if (req.session.currentUser && req.session.currentUser.isAdmin) {
    next()
  } else {
    res.status(401)
    next(new Error('Not authorized as admin'), error)
  }
}

module.exports = admin