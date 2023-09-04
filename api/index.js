const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const _ = require("lodash");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/api/:param1/:param2/:param3/:param4?/:param5?", async (req, res) => {
  try {
    const param1 = req.params.param1 || undefined;
    const param2 = req.params.param2 || undefined;
    const param3 = req.params.param3 || undefined;
    const param4 = req.params.param4 || undefined;
    const param5 = req.params.param5 || undefined;
if (param1 === "pikanetwork") {
    if (param2 === "punishments") {
      const data = await scrapePunishmentsData(
        `https://pika-network.net/bans/search/${param3}`,
        "getPunishments",
        null
      );
      res.status(200).json(data);
    }
    else if (param2 == "globalPunishments") {
        const data = await scrapePunishmentsData(
            `https://pika-network.net/bans/${param3}/page/${param4 || 1}`,
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


module.exports = app;