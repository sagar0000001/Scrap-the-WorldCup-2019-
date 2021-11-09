const fs = require('fs')
const path = require('path')
const utils = require('util')
const puppeteer = require('puppeteer-core')
const hb = require('handlebars')
const cheerio = require("cheerio")

const chromePaths = require("chrome-paths")
const CHROME_PATH = chromePaths.chrome;


const readFile = utils.promisify(fs.readFile)

async function getTemplateHtml() {
  console.log("Loading template file in memory")
  try {
    const invoicePath = path.resolve("../template.html");
    return await readFile(invoicePath, 'utf8');
  } catch (err) {
    return Promise.reject("Could not load html template");
  }
}
async function generatePdf() {
  let data = {};
  getTemplateHtml().then(async (res) => {
    // Now we have the html code of our template in res object
    // you can check by logging it on console
    // console.log(res)

    // var doc = new DOMParser().parseFromString(res, "text/html");
    // doc.getElementById("header").innerHTML = "Hello Match"


    const $ = cheerio.load(res);
    // console.log($);
    // $('#header').text('Hey Match');
    console.log($('#header').text());
    // $('#header').replaceWith(`<h1 id="header">World cup 2020</h1>`)
    $('#header').text("World cup 2021")
    console.log($('#header').text());
    
    res = $.html()

    // $.html(); // '<!DOCTYPE html><p>Bye moon</p>'

    console.log("Compiing the template with handlebars")
    const template = hb.compile(res, { strict: true });
    // we have compile our code with handlebars
    const result = template(data);
    // We can use this to add dyamic data to our handlebas template at run time from database or API as per need. you can read the official doc to learn more https://handlebarsjs.com/
    const html = result;
    // we are using headless mode
    let browser = await puppeteer.launch({
      // headless: false,
      executablePath: CHROME_PATH,
      // args: [
      //   '--start-maximized' // open browser in full screen
      // ],
      // defaultViewport: null // open website in full browser'screen 
    });
    const page = await browser.newPage()
    // We set the page content as the generated html by handlebars
    await page.setContent(html)
    // We use pdf function to generate the pdf in the same folder as this file.
    await page.pdf({ path: 'Mypdf.pdf', format: 'A4' })
    await browser.close();
    console.log("PDF Generated")
  }).catch(err => {
    console.error(err)
  });
}
generatePdf();