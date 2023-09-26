import "dotenv/config"
import * as fs from "fs/promises"
import puppeteer from "puppeteer-extra"
import stealth from "puppeteer-extra-plugin-stealth"

import { DataFileType } from "./types";
import { exit } from "process";

const delay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const readJsonFile = async (fileName: string): Promise<any> => {
    return JSON.parse(await fs.readFile(fileName, "utf-8"))
}

const writeJsonFile = async (fileName: string, data: any): Promise<unknown> => {
    return fs.writeFile(fileName, JSON.stringify(data, null, 2), "utf-8")
}

const main = async () => {

    puppeteer.use(stealth())

    const browser = await puppeteer.launch({ headless: "new" })
    const page = await browser.newPage()

    // if (process.env.FACEBOOK_COOKIES) {
    //     await page.setCookie(...JSON.parse(process.env.FACEBOOK_COOKIES))
    // }

    const dataFile: DataFileType = await readJsonFile("./data/2023/data.json")

    const currentTime = new Date().toISOString()

    for (let i of dataFile["data"]) {
        await page.goto(i["url"], { waitUntil: "networkidle2" })

        const pageContent: string = await page.content()

        // Find Like
        let likeEl = pageContent.match(/"cannot_see_top_custom_reactions":{"reactors":{"count":(\d+)}/)
        // Find Share
        let shareEl = pageContent.match(/"share_count":{"count":(\d+)/)

        // Skip if cannot find it
        if (!likeEl || !shareEl) {
            // replace new data with old data
            i["like"]["data"].push(i["like"]["value"])
            i["share"]["data"].push(i["share"]["value"])
            i["point"]["data"].push(i["point"]["value"])
            // cache html body
            await fs.writeFile(`./logs/${i["id"]}.html`, pageContent)
            continue
        }

        let likeValue: number = Number(likeEl[1])
        let shareValue: number = Number(shareEl[1])
        let pointValue: number = (shareValue * 5) + likeValue

        i["like"]["value"] = likeValue
        i["like"]["data"].push(likeValue)

        i["share"]["value"] = shareValue
        i["share"]["data"].push(shareValue)

        i["point"]["value"] = pointValue
        i["point"]["data"].push(pointValue)

        console.log(`[${i["id"]}] Point: ${pointValue} Like: ${likeValue} Share: ${shareValue}`);

        await delay((Math.floor(Math.random() * 10) + 1) * 1000)
    }

    dataFile["labels"].push(currentTime)
    dataFile["updatedAt"] = currentTime

    await writeJsonFile("./data/2023/data.json", dataFile)
    await page.close()
    exit()
}

try {
    main()
} catch (error) {
    console.error(error)
}
