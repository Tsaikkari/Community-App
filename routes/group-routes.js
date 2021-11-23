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

// add new group page
router.get('/groups/new', async (req, res, next) => {
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
router.post('/groups/:id/add', async (req, res, next) => {
  try {
    const groupId = req.params.id
    const group = await Group.findById(groupId)
    const userId = req.session.currentUser._id
    if (!group) {
      return next(new Error(`Group ${group} not found`))
    }

    group.members.push(userId)

    await Group.updateOne(group)
    res.redirect(`/groups/${groupId}`)
  } catch (error) {
    next(new Error('Group not found', error))
  }
})

// TODO Fix
// get group detail page
router.get('/groups/:groupId', async (req, res, next) => {
  const id = req.params.groupId
  const group = await Group.findById(id).populate('members')
  try {
    res.render('groups/groupDetails', { group })
  } catch (error) {
    next(new Error('Group not found', error))
  }
})

// get edit group page
router.get('/groups/:id/edit', async (req, res, next) => {
  try {
    const id = req.params.id
    const group = await Group.findById(id)
    res.render('groups/editGroup', { group })
  } catch(error) {

  }
})

// edit group
router.post('/groups/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    const { name, description, image } = req.body
   
    await Group.findByIdAndUpdate(id, {
      name,
      description, 
      image
    }, { new: true })
    res.redirect(`/group/${id}`)
  } catch (error) {
    next(new Error(error.message))
  }
})

// delete group
router.post('/groups/:id/delete', async (req, res, next) => {
  try {
    const id = req.params.id
    await Group.findByIdAndRemove(id)
    res.redirect('/groups')
  } catch (error) {
    next(new Error(error.message))
  }
})



module.exports = router

