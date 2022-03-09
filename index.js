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
  return Number(raw_message.match(/(\d+).shares/i)[1]);
};

const main = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  let member_data = await read_json();

  for (let i of member_data["data"]) {
    await page.goto(i["url"], { waitUntil: "networkidle2" });

    if (page.url().includes("login.php")) continue;

    let page_id = i["url"].replace(
      "https://m.facebook.com/photo.php?fbid=",
      ""
    );


    let like = await get_like(page, page_id);
    let share = await get_share(page, page_id);
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

  member_data["updated_at"] = String(new Date());

  await write_json(member_data);

  await browser.close();
};

main();
