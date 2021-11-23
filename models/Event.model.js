const { Schema, model } = require('mongoose')

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
    groupCreator: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
)

const Event = model('Event', eventSchema)

module.exports = Event