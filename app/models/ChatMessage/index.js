const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

/* ChatMessage schema */
const ChatMessage = new Schema({
  message: {
    type: String,
    required: true,
  },
  room: {
    type: Schema.Types.ObjectId,
    ref: 'chat_rooms'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
}, { timestamps: true });

/**
 * Plugins
 */
ChatMessage.plugin(uniqueValidator, {
  message: 'room/{PATH}-already-in-use'
});

module.exports = mongoose.model('chat_messages', ChatMessage);
