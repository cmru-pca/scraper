import "dotenv/config"
import * as fs from "fs/promises"
import puppeteer from "puppeteer"

import { DataFileType } from "./types";

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
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    const dataFile: DataFileType = await readJsonFile("./data/2023/data.json")

    // const historyFile: any = await readJsonFile("./data/2023/history.json")

    for (let i of dataFile["data"]) {
        await page.goto(i["url"], { waitUntil: "networkidle2" })
        await page.screenshot({ type: "png", path: `./logs/${i["id"]}.png` })

        const pageContent: string = await page.content()

        // Find Like
        let likeEl = pageContent.match(/"share_count":{"count":(\d+)/)
        // Find Share
        let shareEl = pageContent.match(/"cannot_see_top_custom_reactions":{"reactors":{"count":(\d+)}/)

        // Skip if cannot find it
        if (!likeEl || !shareEl) {
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

        await delay(3500)
    }

    dataFile["updatedAt"] = new Date()

    await writeJsonFile("./data/2023/data.json", dataFile)
}

main()