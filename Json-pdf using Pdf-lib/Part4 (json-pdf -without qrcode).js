let fs = require("fs");
let path = require("path");
let minimist = require("minimist");
let args = minimist(process.argv);
let fspromises = fs.promises;
let pdflib = require("pdf-lib");
let qrcode = require("qrcode");

async function run() {
  // load source teams.json
  let sourcePath = path.join(args.sourceFolder, args.sourceFile);
  let teamsJson = await fspromises.readFile(sourcePath, "utf-8").catch((err) => console.log(err));
  let teams = JSON.parse(teamsJson); // js object

  
  // ----pdf without qrcode img---
  
  await fspromises.rm(args.pdfFolder, {recursive: true});
  await fspromises.mkdir(args.pdfFolder, {recursive:true}); // create pdf folder
  
  for(let i=0; i<teams.length; i++) {
    let teamFolder = path.join(args.pdfFolder, teams[i].name);
    await fspromises.mkdir(teamFolder);
    // store pdfs for matches
    for(let j=0; j<teams[i].matches.length; j++) {
      await create_save_match_pdf(teamFolder, teams[i].name, teams[i].matches[j]);
    }
  }
}


async function create_save_match_pdf(teamFolder, teamname, match) {
  // load template pdf
  let templatePdfBytes = await fspromises.readFile(args.tpdf).catch((err)=>console.log(err));
  let pdfDoc = await pdflib.PDFDocument.load(templatePdfBytes);
  let form = pdfDoc.getForm(); // pdf-lib feature, pdf forms
  let t1namefield = form.getTextField('Team1');
  let t2namefield = form.getTextField('Team2');
  let t1scoreField = form.getTextField('Team1score');
  let t2scoreField = form.getTextField('Team2score');
  let resultField = form.getTextField('Result');
  
  t1namefield.setText(teamname);
  t2namefield.setText(match.vsTeam);
  t1scoreField.setText(match.myScore);
  t2scoreField.setText(match.vsScore);
  resultField.setText(match.result);

  let pdfBytes = await pdfDoc.save();
  let pdfname = path.join(teamFolder, teamname +" vs "+ match.vsTeam + ".pdf");
  let count = 0;
  while (fs.existsSync(pdfname)) {
    count++;
    let ab = (count == 0 ? "" : `(${count})`);
    pdfname = path.join(teamFolder, teamname +" vs "+ match.vsTeam + ab + ".pdf");
  }
  await fspromises.writeFile(pdfname, pdfBytes).catch((err)=>console.log(err));

}


run();


/* ## Console
node Part4\ \(json-pdf\).js --sourceFolder=JSONs --sourceFile=teams.json --tpdf=TemplatePdfForm.pdf --pdfFolder=PDFs --qrFolder=qrImages

*/