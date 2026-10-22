class DsCloudAPIError extends Error {
  constructor(message, code = "API_ERROR", status = 500, response = null) {
    super(message);
    this.name = "DsCloudAPIError";
    this.code = code;
    this.status = status;
    this.response = response;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DsCloudAPIError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      response: this.response
    };
  }
}

module.exports = { DsCloudAPIError };
