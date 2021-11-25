const router = require('express').Router();
const multer = require("multer");

const Group = require('../models/Group.model')
const User = require('../models/User.model')

const upload = multer({ dest: "./public/uploads" });

const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");

// get all groups and render
router.get("/groups", async (req, res, next) => {
  try {
    const groups = await Group.find();
    res.render("groups/index", { groups });
  } catch (error) {
    next(new Error("No groups", error));
  }
});

// get add new group page
router.get("/groups/new", isLoggedIn, async (req, res, next) => {
  try {
    res.render("groups/newGroup");
  } catch (error) {
    next(new Error(error.message));
  }
});

// create a group
router.post('/groups', isLoggedIn, upload.single("photo"), async (req, res, next) => {
  try {
    const { name, description, image } = req.body
    const id = req.session.currentUser._id
    const imagePath =req.file? `/uploads/${req.file.filename}`:'';

    if (!id) {
      next(new Error(`User not found`));
    }

    req.session.currentUser.isGroupCreator = true;

    await Group.create({
      members: [id],
      name, 
      description, 
      image, 
      events: [],
      imagePath: imagePath,
    })

    res.redirect("/groups");
  } catch (error) {
    next(new Error("Error", error));
  }
});

// TODO: search bar
const findByName = async (groupName) => {
  try {
    const regex = new RegExp(`${groupName}`, "ig");
    const group = await Group.find({ name: { $regex: regex } });

    return group;
  } catch (error) {
    throw new Error(`Group ${groupName} not found`);
  }
};

// add user to group
router.post("/groups/:id/add", isLoggedIn, async (req, res, next) => {
  try {
    const groupId = req.params.id
    const group = await Group.findById(groupId).populate('members')
    const userId = req.session.currentUser._id

    const user = await User.findByIdAndUpdate(userId, {
      $addToSet: { gMember: groupId },
    });
    await Group.findByIdAndUpdate(groupId, {
      $addToSet: { members: userId },
    });

    res.render("groups/groupDetails", {
      OurMessege: "You are added to our group",
      group,
      user: user.username,
    });
  } catch (error) {
    next(new Error("Group not found", error));
  }
});

// get group detail page
router.get('/groups/:groupId', isLoggedIn, async (req, res, next) => {
  try {
    const id = req.params.groupId
    const group = await Group.findById(id).populate('members')
    const user = req.session.currentUser
    
    res.render('groups/groupDetails', { group, isGroupCreator: user.isGroupCreator })
  } catch (error) {
    next(new Error("Group not found", error));
  }
});

// get edit group page
router.get("/groups/:id/edit", isLoggedIn, async (req, res, next) => {
  try {
    const id = req.params.id;
    const group = await Group.findById(id);
    res.render("groups/editGroup", { group });
  } catch (error) {
    next(new Error(error.message));
  }
});

// edit group
router.post("/groups/:id", isLoggedIn, async (req, res, next) => {
  try {
    const id = req.params.id
    const { name, description, image, events } = req.body
    const imagePath =req.file? `/uploads/${req.file.filename}`:'';

    await Group.findByIdAndUpdate(id, {
      name,
      description, 
      image,
      events,
      imagePath: imagePath
    }, { new: true })
    res.redirect(`/groups`)
  } catch (error) {
    next(new Error(error.message));
  }
});

// delete group
router.post("/groups/:id/delete", isLoggedIn, async (req, res, next) => {
  try {
    const id = req.params.id;
    await Group.findByIdAndRemove(id);
    res.redirect("/groups");
  } catch (error) {
    next(new Error(error.message));
  }
});

// create an event
router.post("/groups/:groupId/events", isLoggedIn, async (req, res, next) => {
  try {
    const { name, description, date, time, address } = req.body;
    const groupId = req.params.groupId;
    const group = await Group.findById(groupId);

    if (group) {
      const event = {
        name,
        description,
        date,
        time,
        address,
        groupCreator: req.session.currentUser._id,
      };

      group.events.push(event);
    }

    await group.save();

    res.redirect("/groups");
  } catch (error) {
    next(new Error(error.message));
  }
});

// get add events page of a group
router.get("/groups/:id/events/new", isLoggedIn, async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id).populate("events");
    res.render("groups/newGrEvent", { group });
  } catch (error) {
    next(new Error("Events not found", error));
  }
});

module.exports = router;
