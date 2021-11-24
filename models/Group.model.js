const { Schema, model } = require("mongoose");

const eventSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    date: {
      type: Date,
      retuired: true
    },
    time: {
      type: String,
      required: true
    },
    address: {
      type: String
    },
    groupCreator: {
      type: Schema.Types.ObjectId,
      required: true, 
      ref: 'user'
    },
  },
  {
    timestamps: true
  }
)

const groupSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true
    },
    description: {
      type: String,
      required: true,
    },
    image: String,
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    events: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Event'
      }
    ]
  },
  {
    timestamps: true,
  }
);

const Group = model("Group", groupSchema);
const Event = model("Event", eventSchema)

module.exports = { Group, Event }
