const router = require('express').Router();

const Group = require('../models/Group.model')
const { isLoggedIn, isLoggedOut } = require('../middleware/route-guard.js');

// get all groups and render
router.get('/groups', async (req, res, next) => {
  try {
    const groups = await Group.find()
    res.render('groups/index', { groups })
  } catch (error) {
    next(new Error('No groups', error))
  }
})

router.get('/groups/new', async (req, res, next) => {
  try {
    res.render('groups/newGroup')
  } catch (error) {
    next(new Error(error.message))
  }
})

// create a group
router.post('/groups', async (req, res, next) => {
  try {
    const { name, description, image } = req.body
    //const user = req.session.currentUser

    // if (!user) {
    //   next(new Error(`User ${user} not found`))
    // }

    //user.role === 'admin'

    const newGroup = await Group.create({
      //...user,
      name, 
      description, 
      image   
    })

    await Group.save(newGroup)

    res.redirect('/groups')
  } catch (error) {
    console.log(error)
    next(new Error('Error'))
  }
})

// add user to group
router.post('/groups/:groupId/add/', isLoggedIn, async (req, res, next) => {
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

