// const functions = require("firebase-functions");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  organization: "org-6p7qAUz2Zhr2MVY0qmfGAgvS",
  apiKey: "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",
});

const openai = new OpenAIApi(configuration);

module.exports = openai;
