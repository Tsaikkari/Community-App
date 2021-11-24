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

// get add new group page
router.get('/groups/new', isLoggedIn, async (req, res, next) => {
  try {
    res.render('groups/newGroup')
  } catch (error) {
    next(new Error(error.message))
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
      
    req.session.currentUser.isGroupCreator = true

    await Group.create({
      members: [id],
      name, 
      description, 
      image, 
    })

    res.redirect('/groups')
  } catch (error) {
    next(new Error('Error', error))
  }
})

// TODO: search bar
const findByName = async (groupName) => {
  try {
    const regex = new RegExp(`${groupName}`, 'ig')
    const group = await Group.find({ name: { $regex: regex }})

    return group
  } catch (error) {
    throw new Error(`Group ${groupName} not found`)
  }
}

// add user to group
router.post('/groups/:id/add', isLoggedIn, async (req, res, next) => {
  try {
    const groupId = req.params.id
    const group = await Group.findById(groupId).populate('members')
    const userId = req.session.currentUser._id

    const members = group.members.push(userId)
    
    await Group.findByIdAndUpdate(groupId, { ...group, members })
    res.redirect(`/groups`)
  } catch (error) {
    next(new Error(error.message))
  }
})

// get group detail page
router.get('/groups/:groupId', isLoggedIn, async (req, res, next) => {
  const id = req.params.groupId
  const group = await Group.findById(id).populate('members')
  try {
    res.render('groups/groupDetails', { group })
  } catch (error) {
    next(new Error('Group not found', error))
  }
})

// get edit group page
router.get('/groups/:id/edit', isLoggedIn, async (req, res, next) => {
  try {
    const id = req.params.id
    const group = await Group.findById(id)
    res.render('groups/editGroup', { group })
  } catch(error) {
    next(new Error(error.message))
  }
})

// edit group
router.post('/groups/:id', isLoggedIn, async (req, res, next) => {
  try {
    const id = req.params.id
    const { name, description, image, events } = req.body
   
    await Group.findByIdAndUpdate(id, {
      name,
      description, 
      image,
      events
    }, { new: true })
    res.redirect(`/groups`)
  } catch (error) {
    next(new Error(error.message))
  }
})

// delete group
router.post('/groups/:id/delete', isLoggedIn, async (req, res, next) => {
  try {
    const id = req.params.id
    await Group.findByIdAndRemove(id)
    res.redirect('/groups')
  } catch (error) {
    next(new Error(error.message))
  }
})

// TODO
// get add events page of a group
router.get('/groups/:id/events/new', isLoggedIn, async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
    console.log('GRRRROOOOOOUUUUUP', group)
    res.render('/groups/newGrEvent', { group })
  } catch (error) {
    next(new Error('Events not found', error))
  }
})

// create an event
router.post('/groups/:id/events', isLoggedIn, async (req, res, next) => {
  try {
    const { name, description, date, address } = req.body
    const id = req.params.id

    const group = await Group.findById(id)

    const event = {
      name,
      description, 
      date, 
      address,
      groupCreator: req.session.currentUser._id
    }

    group.events.push(event)

    await group.create(event)
    res.redirect(`/groups`)
  } catch (error) {
    next(new Error(error.message))
  }
})

module.exports = router

