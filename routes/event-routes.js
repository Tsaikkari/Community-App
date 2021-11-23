const router = require('express').Router();

const Group = require('../models/Group.model')
const { isLoggedIn, isLoggedOut } = require('../middleware/route-guard');

// create event
router.post('/groups/:id/events/add', isLoggedIn, async (req, res, next) => {
  try {
    const { name, description, date, address, groupCreator } = req.body
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

    await group.save()
  } catch (error) {
    next(new Error(error.message))
  }
})