const router = require('express').Router()

const Group = require('../models/Group.model')
const User = require('../models/User.model')
const { isLoggedIn, isLoggedOut } = require('../middleware/route-guard.js')

const uploader = require('../config/cloudinary.config')

// get all groups and render
router.get('/groups', async (req, res, next) => {
  try {
    const groups = await Group.find()

    res.render('groups/index', { groups, user: req.session.currentUser })
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
router.post('/groups', uploader.single('image'), async (req, res, next) => {
  try {
    const { name, description } = req.body
    const image = req.file.path
    const id = req.session.currentUser._id

    if (!id) {
      next(new Error(`User not found`))
    }

    req.session.currentUser.isGroupCreator = true

    const group = await Group.create({
      members: [id],
      creator: id,
      name,
      description,
      image: image,
      events: [],
    })

    res.redirect('/groups')
  } catch (error) {
    next(new Error('Error', error))
  }
})

// add user to group
router.post('/groups/:id/add', isLoggedIn, async (req, res, next) => {
  try {
    const groupId = req.params.id
    await Group.findById(groupId).populate('members')
    const userId = req.session.currentUser._id

    await User.findByIdAndUpdate(userId, {
      $addToSet: { gMember: groupId },
    })
    await Group.findByIdAndUpdate(groupId, {
      $addToSet: { members: userId },
    })

    res.redirect(`/groups/${groupId}`)
  } catch (error) {
    next(new Error('Group not found', error))
  }
})

// get group detail page
router.get('/groups/:groupId', isLoggedIn, async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('members')
      .populate('events')
    const events = group.events.map((event) => {
      return {
        groupId: req.params.groupId,
        event,
      }
    })

    res.render('groups/groupDetails', {
      events,
      group,
      user: req.session.currentUser,
      isAdmin:
        req.session.currentUser && req.session.currentUser._id == group.creator,
    })
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
  } catch (error) {
    next(new Error(error.message))
  }
})

// update group
router.post(
  '/groups/:id',
  isLoggedIn,
  uploader.single('image'),
  async (req, res, next) => {
    try {
      const id = req.params.id
      const { name, description, image, events } = req.body

      await Group.findByIdAndUpdate(
        id,
        {
          name,
          description,
          image,
          events,
        },
        { new: true }
      )
      res.redirect(`/groups/${id}`)
    } catch (error) {
      next(new Error(error.message))
    }
  }
)

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

// create an event
router.post('/groups/:groupId/events', isLoggedIn, async (req, res, next) => {
  try {
    const { name, description, date, time, address } = req.body
    const groupId = req.params.groupId
    const group = await Group.findById(groupId)
    const eventDate = new Date(date).toLocaleString().split(',')[0].split('/')
    const formatted = `${eventDate[1]}.${eventDate[0]}.${eventDate[2]}`

    if (group) {
      const event = {
        name,
        description,
        date: formatted,
        time,
        address,
        groupCreator: req.session.currentUser._id,
      }

      group.events.push(event)
    }

    await group.save()

    res.redirect(`/groups/${groupId}`)
  } catch (error) {
    next(new Error(error.message))
  }
})

// get add events page of a group
router.get('/groups/:id/events/new', isLoggedIn, async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id).populate('events')
    res.render('groups/newGrEvent', { group })
  } catch (error) {
    next(new Error('Events not found', error))
  }
})

// get edit event page
router.get('/groups/:groupId/events/:name/edit', async (req, res, next) => {
  try {
    const groupId = req.params.groupId
    const eventId = req.params.eventId

    const group = await Group.findById(groupId).populate('events')
    const event = group.events.filter((event) => event._id === eventId)

    res.render('groups/editEvent', { group, event })
  } catch (error) {
    next(new Error(error.message))
  }
})

module.exports = router
