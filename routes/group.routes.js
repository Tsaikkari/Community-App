const router = require('express').Router();

const Group = require('../models/Group.model')
const { isLoggedIn, isLoggedOut } = require('../middleware/route-guard.js');

// get all groups and render
router.get('/groups', isLoggedIn(), async (req, res, next) => {
  try {
    const groups = await Group.find()
    res.render('groups/index', { groups })
  } catch (error) {
    next(new Error('No groups', error))
  }
})

// create a group
router.post('/groups/new', isLoggedIn(), async (req, res, next) => {
  try {
    const group = req.body
    const user = req.session.currentUser

    if (!user) {
      next(new Error(`User ${user} not found`))
    }

    user.role === 'admin'

    const newGroup = Group.create({
      ...user,
      group: group
    })

    await Group.save(newGroup)

    res.redirect('/groups')
  } catch (error) {
    next(new Error('User not found'))
  }
})

// add user to group
router.post('/groups/:groupId/add/', isLoggedIn(), async (req, res, next) => {
  try {
    const groupId = req.params.groupId
    const user = req.session.currentUser

    const group = await Group.findById(groupId).populate('members')

    if (!group) {
      return next(new Error(`Group ${group} not found`))
    }

    group.members.push(user)

    await Group.save(group)

  } catch (error) {
    next(new Error(error.message))
  }
})

// edit group
router.post('/groups/:id/edit', (req, res, next) => {
  try {

  } catch(error) {

  }
})

module.exports = router

