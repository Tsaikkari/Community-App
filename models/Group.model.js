const { Schema, model } = require("mongoose");

const eventSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      retuired: true
    },
    address: {
      type: String
    },
    user: {
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
    events: [eventSchema]
  },
  {
    timestamps: true,
  }
);

const Group = model("Group", groupSchema);

module.exports = Group;
