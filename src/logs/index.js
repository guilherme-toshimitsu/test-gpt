const { Logging } = require("@google-cloud/logging");
const functions = require("firebase-functions");
// const functions = require("firebase-functions");

//wetrek-151fc
//wetrek-dev
const logging = new Logging({
  // projectId: functions.config().logging.project,
  projectId: "wetrek-151fc",
});

const { createLogger, format, transports } = require("winston");
const { LoggingWinston } = require("@google-cloud/logging-winston");

const loggingWinston = new LoggingWinston();

const logger = createLogger({
  format: format.combine(format.splat(), format.simple()),
  transports: [
    new transports.Console(),
    ...(process.env.CLOUD_ENV === "gcp" ? [loggingWinston] : []),
  ],
});

const createInfoLogger = (functionName, message) => {
  const logName = "info";
  const log = logging.log(logName);
  const METADATA = {
    resource: {
      type: "cloud_function",
      labels: {
        function_name: functionName,
        region: "us-central1",
      },
    },
  };

  let logger = {
    event: functionName,
    value: "info",
    message: `${message}`,
  };

  log.write(log.entry(METADATA, logger));
};

const createErrorLogger = (functionName, message) => {
  const logName = "errors";
  const log = logging.log(logName);
  const METADATA = {
    resource: {
      type: "cloud_function",
      labels: {
        function_name: functionName,
        region: "us-central1",
      },
    },
    severity: "ERROR",
  };

  let logger = {
    event: functionName,
    value: "Error",
    message: `${message}`,
  };

  log.write(log.entry(METADATA, logger));
};

const reportError = (err, context = {}) => {
  // This is the name of the StackDriver log stream that will receive the log
  // entry. This name can be any valid log stream name, but must contain "err"
  // in order for the error to be picked up by StackDriver Error Reporting.
  const logName = "errors";
  const log = logging.log(logName);

  // https://cloud.google.com/logging/docs/api/ref_v2beta1/rest/v2beta1/MonitoredResource
  const metadata = {
    resource: {
      type: "cloud_function",
      labels: { function_name: process.env.FUNCTION_NAME },
    },
  };

  // https://cloud.google.com/error-reporting/reference/rest/v1beta1/ErrorEvent
  const errorEvent = {
    message: err.stack,
    serviceContext: {
      service: process.env.FUNCTION_NAME,
      resourceType: "cloud_function",
    },
    context: context,
  };

  // Write the error log entry
  return new Promise((resolve, reject) => {
    log.write(log.entry(metadata, errorEvent), (error) => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
};

const userFacingMessage = (error) => {
  return error.type
    ? error.message
    : "An error occurred, developers have been alerted";
};

const logInfo = (errorString, errorObject) => {
  functions.logger.info(errorString, errorObject);
};

const logError = (errorMessage, errorObject) => {
  functions.logger.error(errorMessage, errorObject);
};

module.exports = {
  createInfoLogger,
  createErrorLogger,
  reportError,
  userFacingMessage,
  logInfo,
  logError,
  logger,
};
