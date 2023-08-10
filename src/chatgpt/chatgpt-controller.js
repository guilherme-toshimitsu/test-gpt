const router = require("express").Router();
// const { OK } = require("http-status-codes").StatusCodes;

const openai = require("./openai");
const { generatePrompt, generatePromptJson } = require("./utils");
const { logger } = require("../logs");

// const FUNCTION_NAME = "chatgptExpress";

router.post("/gptstream", async (req, res) => {
  try {
    let prompt;
    try {
      let data = req.body;
      logger.info(`call gptstream with: \n ${JSON.stringify(data)}`);
      prompt = generatePromptJson(data);
      if (!prompt) {
        logger.error("error generating your prompt");
        res.status(500).send({
          message: "Error generating prompt please contact a developer",
        });
      }
    } catch (e) {
      logger.error("error generating your prompt");
      res.status(500).send({
        message: "Error generating prompt please contact a developer",
      });
    }

    logger.info(`call gptstream with: \n ${prompt}`);
    const response = await openai.createChatCompletion(
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        // max_tokens: 100,
        temperature: 0.2,
        stream: true,
      },
      { responseType: "stream" }
    );
    // res.statusCode = 200;
    // res.writeHead(200, {
    //   "Content-Type": "text/plain",
    //   "Transfer-Encoding": "chunked",
    // });

    const decoder = new TextDecoder("utf-8");
    let fullstream = "";
    response.data.on("data", (data) => {
      const decodedChunk = decoder.decode(data);
      const lines = decodedChunk
        .split("\n")
        .filter((line) => line.trim() !== "");
      // console.log(lines);
      for (const line of lines) {
        const message = line.replace(/^data: /, "");
        try {
          const parsed = JSON.parse(message);
          if (parsed.choices[0].finish_reason) {
            logger.info(`gptstream response: \n ${fullstream}`);
            res.status(200).end("");
            return; // Stream finished
          } else {
            fullstream = fullstream + parsed.choices[0].delta.content;
            res.write(parsed.choices[0].delta.content);
          }
        } catch (error) {
          logger.error(error);
          res.status(500).send({ message: error });
        }
      }
    });
  } catch (e) {
    logger.error(e);
    res.status(500).send({ message: e });
  }
});

router.post("/promptstream", async (req, res) => {
  try {
    let prompt = req.body.prompt;
    if (!prompt) {
      logger.error("no prompt");
      res.status(500).send({
        message: "Error generating prompt please contact a developer",
      });
    }

    logger.info(`call gptstream with: \n ${prompt}`);
    const response = await openai.createChatCompletion(
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        // max_tokens: 100,
        temperature: 0.1,
        stream: true,
      },
      { responseType: "stream" }
    );
    // res.statusCode = 200;
    // res.writeHead(200, {
    //   "Content-Type": "text/plain",
    //   "Transfer-Encoding": "chunked",
    // });
    const decoder = new TextDecoder("utf-8");
    let fullstream = "";
    response.data.on("data", (data) => {
      const decodedChunk = decoder.decode(data);
      const lines = decodedChunk
        .split("\n")
        .filter((line) => line.trim() !== "");
      // console.log(lines);
      for (const line of lines) {
        const message = line.replace(/^data: /, "");
        try {
          const parsed = JSON.parse(message);
          if (parsed.choices[0].finish_reason) {
            logger.info(`gptstream response: \n ${fullstream}`);
            res.status(200).end("");
            return; // Stream finished
          } else {
            fullstream = fullstream + parsed.choices[0].delta.content;
            res.write(parsed.choices[0].delta.content);
          }
        } catch (error) {
          logger.error(error);
          res.status(500).send({ message: error });
        }
      }
    });
  } catch (e) {
    logger.error(e);
    res.status(500).send({ message: e });
  }
});

module.exports = router;
