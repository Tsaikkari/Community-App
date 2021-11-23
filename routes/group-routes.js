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

router.get('/groups/:groupId', async (req, res, next) => {
  try {
    res.render('groups/groupDetails')
  } catch (error) {
    next(new Error('Group not found', error))
  }
})

// create a group
router.post('/groups', isLoggedIn, async (req, res, next) => {
  try {
    const { name, description, image } = req.body
    const id = req.session.currentUser._id

    if (!id) {
      next(new Error(`User not found`))
    }

    req.session.currentUser.role === 'admin'

    await Group.create({
      members: [id],
      name, 
      description, 
      image   
    })

    res.redirect('/groups')
  } catch (error) {
    next(new Error('Error', error))
  }
})

const findByName = async (groupName) => {
  try {
    const regex = new RegExp(`${groupName}`, 'ig')
    const group = await Group.find({ name: { $regex: regex }})

    return group
  } catch (error) {
    throw new Error(`Group ${groupName} not found`)
  }
}

// TODO: fix
// add user to group
router.post('/groups/add/:name', async (req, res, next) => {
  try {
    const queryString = req.query.name
    console.log('queryString', queryString)
    const group = await findByName(queryString).populate('members')
    const userId = req.session.currentUser._id
    if (!group) {
      return next(new Error(`Group ${group} not found`))
    }

    group.members.push(userId)

    await Group.updateOne(group)
  } catch (error) {
    next(new Error('Group not found', error))
  }
})

// edit group
router.post('/groups/:id/edit', (req, res, next) => {
  try {

  } catch(error) {

  }
})

module.exports = router

