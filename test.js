const axios = require("axios");

async function fetchData() {
  try {
    const response = await axios.get("http://localhost/pikanetwork/punishments/notzingame");
    const data = response.data;
    console.log(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

fetchData();
