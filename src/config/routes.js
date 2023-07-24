const healthcheck = require("./healthcheck");
const openai = require("../chatgpt/chatgpt-controller");

const { errorHandler } = require("./error-handler");

const prefix = process.env.API_PREFIX || "api";

console.log(prefix);

module.exports = (app) => {
  app.use(errorHandler);

  app.use(`/healthcheck`, healthcheck);
  app.use(`/openai`, openai);

  console.info(`Rotas registradas com sucesso...`);

  return app;
};
