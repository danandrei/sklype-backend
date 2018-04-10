// Dependencies
const { chatService } = require('../services');
const { getParams, checkParams, isValidObjectId } = require('../helpers/params');
const { ServerError } = require('../helpers/server_error');

function createRoom (userId, data) {
    checkParams(['name'], data);

    return chatService.createChatRoom({
        name: data.name,
        members: [userId],
    });
}

/**
 * Get all chat rooms the user is a member of
 * @param {String} userId
 * @returns {Promise}
 */
function getChatRooms (userId) {
    return chatService.getChatRooms(userId);
}

/**
 * Get a specific chat room that a user is a member of
 * @param {String} userId
 * @param {String} roomId
 * @returns {Promise}
 */
async function getChatRoom(userId, roomId) {
    isValidObjectId(roomId);
    const chatRoom = await chatService.getChatRoom({
        _id: roomId,
        members: {
            $in: [userId]
        }
    });

    if (!chatRoom) {
        throw new ServerError('not-found', 404);
    }

    return chatRoom;
}

/**
 * Get messages of a room that a user if a member of
 * @param {String} userId
 * @param {String} roomId
 * @param {Object} options pagination options (skip, limit)
 * @returns {Promise}
 */
function getChatMessages(userId, roomId, options) {
    isValidObjectId(roomId);
    options = getParams(['skip', 'limit'], options);

    return chatService.getMessages(userId, roomId, options);
}

/**
 * Post message to a chat room
 * @param {String} userId
 * @param {String} roomId
 * @param {Object} data
 * @param {Object} sockets Object containing websocket related methods (sockets.send)
 * @returns {Promise}
 */
async function postMessage(userId, roomId, data, sockets) {
    checkParams(['message'], data);
    isValidObjectId(roomId);
    const chatRoom = await chatService.getChatRoom({
        _id: roomId,
        members: {
            $in: [userId]
        }
    });

    if (!chatRoom) {
        throw new ServerError('not-found', 404);
    }

    // create the new chat message
    const message = await chatService.postMessage(userId, roomId, data.message, sockets);

    chatRoom.members.forEach(member => {
        // send message via sockets to all members
        sockets.send(member._id, {
            name: 'chat_message',
            data: {
                message: message
            }
        });
    });

    return message;
}

module.exports = {
    getChatRoom,
    getChatRooms,
    getChatMessages,
    postMessage,
    createRoom,
};
