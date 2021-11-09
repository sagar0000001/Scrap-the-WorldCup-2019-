let fs = require("fs");
let path = require("path");
let minimist = require("minimist");
let args = minimist(process.argv);
let fspromises = fs.promises;
let qrcode = require("qrcode");
const utils = require('util')
const puppeteer = require('puppeteer-core')
const hb = require('handlebars')
const cheerio = require("cheerio")

const chromePaths = require("chrome-paths")
const CHROME_PATH = chromePaths.chrome;

const readFile = utils.promisify(fs.readFile)

async function run() {
  // load source teams.json
  // let sourcePath = path.join(args.sourceFolder, args.sourceFile);
  let teamsJson = await fspromises.readFile("teams.json", "utf-8").catch((err) => console.log(err));
  let teams = JSON.parse(teamsJson); // js object

  if (fs.existsSync(args.qrFolder)) { // deletes the destination-folder if exists
    fs.rmdirSync(args.qrFolder, { recursive: true })
  } await fspromises.mkdir(args.qrFolder, { recursive: true }); // create qr folder

  if (fs.existsSync(args.pdfFolder)) { // deletes the destination-folder if exists
    fs.rmdirSync(args.pdfFolder, { recursive: true })
  } await fspromises.mkdir(args.pdfFolder, { recursive: true }); // create pdf folder


  for (let i = 0; i < teams.length; i++) {
    let qrFolder = path.join(args.qrFolder, teams[i].name);
    await fspromises.mkdir(qrFolder);

    let teamFolder = path.join(args.pdfFolder, teams[i].name);
    await fspromises.mkdir(teamFolder);

    // pdfs for matches (with qrcode)
    // also seperate folder for qrcodes
    for (let j = 0; j < teams[i].matches.length; j++) {
      await create_save_match_pdf_with_qrcode(qrFolder, teamFolder, teams[i].name, teams[i].matches[j]);
    }
  }
}


async function create_save_match_pdf_with_qrcode(qrFolder, teamFolder, teamname, match) {


  generatePdf(qrFolder, teamFolder, teamname, match);

}

async function getTemplateHtml() {
  console.log("Loading template file in memory")
  try {
    const invoicePath = path.resolve("../template.html");
    return await readFile(invoicePath, 'utf8');
  } catch (err) {
    return Promise.reject("Could not load html template");
  }

  // ..creating template html

}
async function generatePdf(qrFolder, teamFolder, teamname, match) {
  let data = {};
  getTemplateHtml().then(async (res) => {
    // Now we have the html code of our template in res object
    // you can check by logging it on console
    // console.log(res)

    const $ = cheerio.load(res);
    $('#t1').text(teamname)
    $('#t2').text(match.vsTeam)
    $('#t1score').text(match.myScore)
    $('#t2score').text(match.vsScore)
    $('#res').text(match.result)

    res = $.html()

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
    let pdfPath = path.join(teamFolder, teamname +" vs "+ match.vsTeam + ".pdf");
    let count = 0;
    while (fs.existsSync(pdfPath)) {
      count++;
      let ab = (count == 0 ? "" : `(${count})`);
      pdfPath = path.join(teamFolder, teamname +" vs "+ match.vsTeam + ab + ".pdf");
    }

    await page.pdf({ path: pdfPath, format: 'A4' })
    await browser.close();
    console.log("PDF Generated")
  }).catch(err => {
    console.error(err)
  });
}


function qrcreate(qrname, match, teamname) {
  let qrcontent = teamname + ": " + match.myScore + "\n" + match.vsTeam + ": " + match.vsScore + "\nResult: " + match.result + ".";
  // qrcode(image) saved in qrFolder
  qrcode.toFile(qrname, qrcontent, {
    color: {
      dark: '#00F',  // Blue dots
      light: '#0000' // Transparent background
    }
  }, function (err) {
    if (err) throw err
    // console.log('done')
  })
}

run();


/*

node Part5\ \(json-qrcodeimg-pdf\).js --sourceFolder=JSONs --sourceFile=teams.json --tpdf=TemplatePdfForm.pdf --pdfFolder=PDFs --qrFolder=qrImages

*/