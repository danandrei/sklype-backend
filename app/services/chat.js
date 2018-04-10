const { ServerError } = require('../helpers/server_error');
const ChatRoom = require('../models/ChatRoom');
const ChatMessage = require('../models/ChatMessage');

/**
 * create a chat room
 * @param {Object} data Object containing chat room data (name, type, group, webinar)
 * @returns {Promise}
 */
async function createChatRoom (data) {
    const newChat = new ChatRoom(data);

    // validate and create the chat
    try {
        await newChat.validate();
        return newChat.save();
    } catch (validateError) {
        throw new ServerError(validateError, 400);
    }
}

/**
 * Get all chat rooms the user is a member of
 * @param {String} userId
 * @returns {Promise}
 */
async function getChatRooms (userId) {
    const rooms = await ChatRoom
    .find(
        {
            members: {
                $in: [userId]
            }
        }
    )
    .populate([
        {
            path: 'members'
        }
    ])
    .exec()

    return rooms;
}

/**
 * Get a specific chat room based on a filter
 * @param {Object} fiter
 * @returns {Promise}
 */
async function getChatRoom (filter) {
    const room = await ChatRoom
    .findOne(filter)
    .populate([
        {
            path: 'members'
        }
    ])
    .exec();

    return room;
}

/**
 * Add a user to a chat room
 * @param {String} memberId
 * @param {String} roomId
 * @returns {Promise}
 */
function addMember (memberId, roomId) {

    return ChatRoom
    .update(
        {
            _id: roomId,
        },
        {
            $addToSet: {
                members: memberId
            }
        },
        {
            runValidators: true,
        }
    )
    .exec();
}

/**
 * remove a user from a chat room
 * @param {String} memberId
 * @param {String} roomId
 * @returns {Promise}
 */
function removeMember (memberId, roomId) {

    return ChatRoom
    .update(
        {
            _id: roomId,
        },
        {
            $pull: {
                members: memberId
            }
        },
        {
            runValidators: true,
        }
    )
    .exec();
}

/**
 * Get messages of a room that a user if a member of
 * @param {String} userId
 * @param {String} roomId
 * @param {Object} options pagination options (skip, limit)
 * @returns {Promise}
 */
async function getMessages (userId, roomId, options={}) {
    const room = await ChatRoom.findOne({ _id: roomId }).exec();
    if (!room) {
        throw new ServerError('not-found', 404);
    }

    if (room.members.indexOf(userId) < 0) {
        return [];
    }

    const skip = parseInt(options.skip) || 0;
    const limit = parseInt(options.limit) || 100;

    return ChatMessage
    .find({ room: roomId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate([
        {
            path: 'user'
        }
    ])
    .exec();
}

/**
 * Post message to a chat room
 * @param {String} userId
 * @param {String} roomId
 * @param {String} message
 * @param {Object} sockets Object containing websocket related methods (sockets.send)
 * @returns {Promise}
 */
async function postMessage (userId, roomId, message, sockets) {

    const newMessage = new ChatMessage({
        user: userId,
        message: message,
        room: roomId,
    });

    // validate and create the message
    try {
        await newMessage.validate();
        await newMessage.save();

        await ChatMessage
        .populate(newMessage,
            {
                path: 'user'
            }
        )
    } catch (validateError) {
        throw new ServerError(prettifyError(validateError), 400);
    }

    return newMessage;
}

module.exports = {
    createChatRoom,
    getChatRoom,
    getChatRooms,
    addMember,
    removeMember,
    getMessages,
    postMessage,
};
