class ServerError {
  constructor(error, status = 500) {
    this.message = typeof error === 'object' ? error.message : error;
    this.status = status;
  }
}

module.exports = {
  ServerError,
};
