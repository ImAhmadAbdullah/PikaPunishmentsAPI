const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const _ = require("lodash");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const networks = {
  pikanetwork: {
    baseUrl: "https://pika-network.net",
    punishments: ["bans", "kicks", "mutes", "warnings", "issued", undefined],
  },
  jartexnetwork: {
    baseUrl: "https://jartexnetwork.com",
    punishments: ["bans", "kicks", "mutes", "warnings", "issued", undefined],
  },
  snapcraft: {
    baseUrl: "https://snapcraft.net",
    punishments: ["bans", "kicks", "mutes", "issued", undefined],
  },
};

function buildScrapeURL(network, type, search, filter) {
  return `${networks[network].baseUrl}/bans/${
    type === "globalPunishments" ? `${filter}/page` : `search/${search}`
  }/?filter=${filter || ""}`;
}
app.get("/api/:network/:type/:param3?/:param4?/:param5?", async (req, res) => {
  try {
    const { network, type, param3, param4 } = req.params;

    if (!networks[network] || !networks[network].punishments.includes(param4)) {
      throw new Error("The parameters provided are invalid.");
    }
    if (type === "punishments" || type === "globalPunishments") {
      const url = buildScrapeURL(network, type, param3, param4);
      const html = fetchData(url);
      const data = await scrapePunishmentsData(
        html,
        param4 === "issued" ? "issuedPunishments" : type,
        param3
      );
      res.status(200).json(data);
    } else if (type === "staff") {
      const url = `${networks[network].baseUrl}/staff`;
      const data = await fetchStaff(url);
      res.status(200).json(data);
    }
  } catch (error) {
    res.status(500).json({
      error: "An error occurred, contact @mrspeedy35 on Discord if the issue persists.",
      message: error.message,
    });
  }
});
async function fetchStaff(url) {
  const staffRoles = new Set([
    "owner",
    "manager",
    "lead developer",
    "java developer",
    "game producer",
    "configurator",
    "discord developer",
    "quality assurance",
    "admin",
    "sr mod",
    "moderator",
    "helper",
    "trial",
  ]);
  try {
    const html = fetchData(url);

    const staff = {};
    for (const role of staffRoles) {
      const roleName = role.replace(/\s/g, "");
      staff[roleName] = [];
    }

    const $ = cheerio.load(html);

    $("span").each((_i, el) => {
      const text = $(el).text().trim().toLowerCase();
      if (staffRoles.has(text)) {
        const role = text.replace(/\s/g, "");
        const username = $(el).prev().text().trim().replace(/\s/g, "");
        staff[role].push(username);
      }
    });

    return staff;
  } catch (error) {
    console.error("Error: An error occurred during scraping.");
    throw error;
  }
}
async function fetchData(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    return html;
  } catch (error) {
    throw new Error("An error occurred while fetching data.");
  }
}
async function scrapePunishmentsData(html, functionName, filterParam) {
  try {
    const $ = cheerio.load(html);
    const bans = [];

    $(".row").each((index, element) => {
      const $element = $(element);
      const type =
        functionName === "globalPunishments"
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
      if (functionName === "punishments") {
        _.unset(ban, "player");
        _.unset(ban, "playerAvatar");
      } else if (functionName === "issuedPunishments") {
        _.unset(ban, "staff");
        _.unset(ban, "staffAvatar");
      }
      bans.push(ban);
    });

    return bans;
  } catch (error) {
    throw new Error("An error occurred while fetching data.");
  }
}

module.exports = app;
