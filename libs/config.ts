import puppeteer from 'puppeteer-extra';
import stealth from 'puppeteer-extra-plugin-stealth';

export const configurePuppeteer = async () => {
    puppeteer.use(stealth());

    return await puppeteer.launch({ headless: 'new' });
}
