const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

/* ChatRoom schema */
const ChatRoom = new Schema({
  name: {
    type: String,
    required: true,
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'users'
  }],
}, { timestamps: true });

/**
 * Plugins
 */
ChatRoom.plugin(uniqueValidator, {
  message: 'room/{PATH}-already-in-use'
});

module.exports = mongoose.model('chat_rooms', ChatRoom);
