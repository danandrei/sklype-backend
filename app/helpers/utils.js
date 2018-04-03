const logger = require('winston');
const bcrypt = require('bcrypt');
const fs = require('fs-extra');

/**
 * Generate a random id with the given length
 * @param {Number} length
 * @returns {String} the generated id
 */
function makeId (length) {
	let text = '';
	let possible = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return text;
}

/**
 * Remove specified temp file.
 * @param {String} path
 */
function cleanupTempFile (file) {

	if (!file) {
		return;
	}

	fs.unlink(file.path)
	.catch(error => {

		if (error) {
			logger.log('error', 'Failed to delete temp photo: ' + file.path);
		}
	});
}

/**
 * Create hash from value
 * @param {String} value
 */
function createHash (value, callback) {

	bcrypt.genSalt(10, (error, salt) => {

		if (error) {
			return callback(error)
		};

		bcrypt.hash(value, salt, (error, hash) => {

			if (error) {
				return callback(error)
			};

			return callback(null, hash);
		});
	});
}

module.exports = {
	makeId,
	cleanupTempFile,
	createHash,
}
