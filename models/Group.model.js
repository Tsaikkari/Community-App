const { Schema, model } = require('mongoose')
const eventSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    groupCreator: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'user',
    },
    imagePath: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

const groupSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      trim: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'user',
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    events: [eventSchema],
  },
  {
    timestamps: true,
  }
)

const Group = model('Group', groupSchema)

module.exports = Group
