// import chromium from '@sparticuz/chromium';
// import { chromium as playwrightChromium } from 'playwright-core';
const playwright = require('playwright-core');
// const chromium = require('chrome-aws-lambda');

export const scrape: any = async (event: any) => {
    try {
        // const browser = await chromium.puppeteer.launch({
        //     args: chromium.args,
        //     executablePath: await chromium.executablePath,
        //     headless: chromium.headless,
        // });

    }catch (error) {
        console.error('Error launching browser:', error);
        return {
            statusCode: 500,
            body: `Error launching browser:`
        };
    }
    // console.log('Current working directory:', process.cwd());
    // console.log('event:' + JSON.stringify(event));
    //
    // console.log('chromium.args:', await chromium);
    // console.log('chromium.path:', process.env.CHROMIUM_PATH);
    // console.log('chromium.args:', await chromium.executablePath());
    // const executablePath=await chromium.executablePath(
    //     'https://github.com/Sparticuz/chromium/releases/download/v119.0.2/chromium-v119.0.2-pack.tar',
    // );
    // const executablePath = process.env.CHROMIUM_PATH || await chromium.executablePath();
    // console.log('executablePath:' + executablePath);
    // const browser = await playwrightChromium.launch({
    //     args: chromium.args,
    //     executablePath: executablePath,
    //     headless: true,
    // });
    //
    // const page = await browser.newPage();
    // await page.goto('https://www.newegg.com/p/pl?d=logi', {
    //     waitUntil: 'domcontentloaded',
    // });
    //
    // const title = await page.title();
    //
    // await browser.close();

    return {
        statusCode: 200,
        body: "title"
    };
};