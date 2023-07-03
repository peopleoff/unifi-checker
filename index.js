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
  "https://store.ui.com/collections/unifi-protect/products/g4-doorbell-pro",
  "https://store.ui.com/us/en/products/uacc-adapter-dbpoe",
  "https://store.ui.com/us/en/pro/category/all-cameras-nvrs/products/uacc-g5-enhancer"
];

function checkItems() {
  const requests = [];

  itemsToCheck.forEach((url) => {
    requests.push(axios.get(url));
  });

  axios.all(requests).then((result) => {
    result.forEach((res) => {
      const root = parse(res.data);
      const title = root.querySelector('title').text.split('-')[0].trim();
      const addToCart = root.querySelector('button[label="Add to Cart"]');
      if (addToCart) sendText(`${title} is in stock`);
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
cron.schedule("* * * * *", () => {
  checkItems();
});

//Run once a week at 12:00 on Monday to ensure texting is working
cron.schedule("0 12 * * 1", () => {
  sendText("Unify Works");
});

// Run on startup to ensure texting is working
sendText("UnifyWorks");