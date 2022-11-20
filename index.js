require("dotenv").config();
const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM_NUMBER,
  TWILIO_TO_NUMBER,
} = process.env;
const axios = require("axios");
const { parse } = require("node-html-parser");
const cron = require("node-cron");
const twilio = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const itemsToCheck = [
  "https://store.ui.com/collections/unifi-network-smartpower/products/usp-pdu-pro",
  "https://store.ui.com/collections/unifi-protect/products/g4-doorbell-pro",
  "https://store.ui.com/collections/unifi-protect-accessories/products/smart-sensor",
];

function checkItems() {
  const requests = [];

  itemsToCheck.forEach((url) => {
    requests.push(axios.get(url));
  });

  axios.all(requests).then((result) => {
    result.forEach((res) => {
      const root = parse(res.data);
      const title = root.querySelector(".comProduct__title").text;
      const soldOut = root.querySelector("#titleSoldOutBadge");
      if (!soldOut) sendText(`${title} is in stock`);
    });
  });
}

function sendText(message) {
  twilio.messages.create({
    body: message,
    from: TWILIO_FROM_NUMBER,
    to: TWILIO_TO_NUMBER,
  });
}

//Run every hour and check website for items.
cron.schedule("0 * * * *", () => {
  console.log("Checking Items");
  checkItems();
});

//Run once a week at 12:00 on Monday to ensure texting is working
cron.schedule("0 12 * * 1", () => {
  console.log("Weekly Text that this works");
  sendText("Unify Works");
});

//Run on startup to ensure texting is working
sendText("UnifyWorks");
