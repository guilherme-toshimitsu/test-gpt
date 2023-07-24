const router = require("express").Router();
// const { OK } = require("http-status-codes").StatusCodes;

const openai = require("./openai");
const { generatePrompt } = require("./utils");
const { logger } = require("../logs");

// const FUNCTION_NAME = "chatgptExpress";

router.post("/gptstream", async (req, res) => {
  res.statusCode = 200;
  res.writeHead(200, {
    "Content-Type": "text/plain",
    "Transfer-Encoding": "chunked",
  });

  try {
    let data = req.body;
    logger.info(JSON.stringify(data));
    let prompt = generatePrompt(data);
    if (!prompt) {
      res.status(500).send({
        message: "Error generating prompt please contact a developer",
      });
    }

    const response = await openai.createChatCompletion(
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        // max_tokens: 100,
        // temperature: 0,
        stream: true,
      },
      { responseType: "stream" }
    );

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
            functions.logger.info("ChatGPTEndedStream", {
              stream: fullstream,
            });
            logger.info(fullstream);
            res.end("");
            return; // Stream finished
          } else {
            res.write(parsed.choices[0].delta.content);
            fullstream.concat(parsed.choices[0].delta.content);
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
