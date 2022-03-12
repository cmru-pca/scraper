require("dotenv").config();

const puppeteer = require("puppeteer");
const fs = require("fs/promises");

const read_json = async () => {
  return fs.readFile("./data/member.json").then((data, err) => {
    if (err) return undefined;
    return JSON.parse(data);
  });
};

const write_json = async (data) => {
  return fs.writeFile(
    "./data/member.json",
    JSON.stringify(data, null, 2),
    "utf-8"
  );
};

const get_like = async (page, page_id) => {
  const code = `//*[@id="like_sentence_${page_id}"]`;
  const element = await page.$x(code);
  const raw_message = await page.evaluate((el) => el.textContent, element[0]);
  return Number(raw_message.match(/.(\d+).others/i)[1]);
};

const get_share = async (page, page_id) => {
  const code = `//*[@id="ufi_${page_id}"]/div/div[3]/a/span`;
  const element = await page.$x(code);
  const raw_message = await page.evaluate((el) => el.textContent, element[0]);
  return Number(raw_message.replace(",", "").match(/(\d+).shares/i)[1]);
};

const main = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  let member_data = await read_json();

  for (let i of member_data["data"]) {
    await page.goto(i["url"], { waitUntil: "networkidle2" });

    let raw_message = await page.evaluate(() =>  document.documentElement.outerHTML);

    let like = Number(raw_message.match(/"cannot_see_top_custom_reactions":{"reactors":{"count":(\d+)}/i)[1])
    let share = Number(raw_message.match(/"share_count":{"count":(\d+),"is_empty":false}/i)[1])

    let point = share * 5 + like;

    i["data"]["old_like"] = i["data"]["like"];
    i["data"]["old_share"] = i["data"]["share"];
    i["data"]["old_point"] = i["data"]["point"];

    i["data"]["like"] = like;
    i["data"]["share"] = share;
    i["data"]["point"] = point;


    console.log(
      `[${i["type"]}${i["id"]}] Point: ${point} Like: ${like} Share: ${share}`
    );

  }

  member_data["updated_at"] = String(
    new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000)
      .toJSON()
      .slice(0, 19)
      .replace("T", " ")
  );

  await write_json(member_data);

  await browser.close();
};

main();
