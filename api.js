const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const _ = require("lodash");
const { EmbedBuilder, WebhookClient } = require("discord.js");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/:param1/:param2/:param3/:param4", async (req, res) => {
  try {
    webhook(req);

    const param1 = req.params.param1;
    const param2 = req.params.param2;
    const param3 = req.params.param3;
    const param4 = req.params.param4;
if (param1 === "pikanetwork") {
    if (param2 === "punishments") {
      const data = await scrapePunishmentsData(
        `https://pika-network.net/bans/search/${player}`,
        "getPunishments",
        null
      );
      res.status(200).json(data);
    }
    else if (param2 == "globalPunishments") {
        const data = await scrapePunishmentsData(
            `https://pika-network.net/bans/${param3}/page/${param4}`,
            "getAllPunishments",
            param3
          );
          res.status(200).json(data);
    }
}
  } catch (error) {
    res.status(500).json({
      error:
        "An error occurred, contact @mrspeedy35 on Discord if the issue persists.",
      message: error.message,
    });
  }
});

async function scrapePunishmentsData(url, functionName, filterParam) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const bans = [];

    $(".row").each((index, element) => {
      const $element = $(element);
      const type =
        functionName === "getAllPunishments"
          ? filterParam.replace("s", "")
          : $element.find(".td._type b").text().trim();
      const staff = $element.find(".td._staff").text().trim() || "N/A";
      const staffAvatar = $element.find(".td._staff img").attr("src");
      const player = $element.find(".td._user").text().trim() || "N/A";
      const reason = $element.find(".td._reason").text().trim();
      const playerAvatar = $element.find(".td._user img").attr("src");
      const date = $element.find(".td._date").text().trim();
      const expires = $element.find(".td._expires").text().trim();
      const ban = {
        type,
        player,
        playerAvatar,
        staff,
        staffAvatar,
        reason,
        date,
        expires,
      };
      if (functionName === "getPunishments") {
        _.unset(ban, "player");
        _.unset(ban, "playerAvatar");
      } else if (functionName === "getIssuedPunishments") {
        _.unset(ban, "staff");
        _.unset(ban, "staffAvatar");
      }
      bans.push(ban);
    });

    return bans;
  } catch (error) {
    throw new Error(`${error}`);
  }
}

async function webhook(req) {
    try {
      const { method, originalUrl, headers, body, query, params } = req;
      const timestamp = `<t:${Math.floor(Date.now() / 1000)}:F>`;
      const webhookClient = new WebhookClient({
        url: "https://discord.com/api/webhooks/1148139003527319673/KNUtk03KVbDlA6Oh-yQQ74nrxRTnn0zWFV4hHfVxGYll4TPd2KZurOVNbyBktgvAtlND",
      });
      const embed = new EmbedBuilder()
        .setTitle("API Request")
        .setColor("#3498db")
        .setDescription("Here are the details of an incoming request:")
        .addFields(
          { name: "Method", value: method },
          { name: "URL", value: originalUrl },
          { name: "Headers", value: JSON.stringify(headers) },
          { name: "Body", value: JSON.stringify(body) },
          { name: "Query", value: JSON.stringify(query) },
          { name: "Params", value: JSON.stringify(params) },
          { name: "Timestamp", value: timestamp }
        );
      await webhookClient.send({ embeds: [embed] });
    } catch (error) {
      throw error;
    }
  }

app.listen(80, () => {
  console.log(`The API has been initiated on port 80.`);
});
