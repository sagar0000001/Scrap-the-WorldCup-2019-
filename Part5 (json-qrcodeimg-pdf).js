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

  await fspromises.rm(args.qrFolder, {recursive: true});
  await fspromises.mkdir(args.qrFolder, {recursive:true}); // create qr folder
  
  await fspromises.rm(args.pdfFolder, {recursive: true});
  await fspromises.mkdir(args.pdfFolder, {recursive:true}); // create pdf folder

  
  for(let i=0; i<teams.length; i++) {
    let qrFolder = path.join(args.qrFolder, teams[i].name);
    await fspromises.mkdir(qrFolder);

    let teamFolder = path.join(args.pdfFolder, teams[i].name);
    await fspromises.mkdir(teamFolder);
    
    // pdfs for matches (with qrcode)
    // also seperate folder for qrcodes
    for(let j=0; j<teams[i].matches.length; j++) {
      await create_save_match_pdf_with_qrcode(qrFolder, teamFolder, teams[i].name, teams[i].matches[j]);
    }
  }
}


async function create_save_match_pdf_with_qrcode(qrFolder, teamFolder, teamname, match) {

  // saving qrcodes(img) in folder
  let qrname = path.join(qrFolder, teamname +" vs "+ match.vsTeam + ".png");// qr path
  let count = 0;
  while (fs.existsSync(qrname)) { 
    count++;
    let ab = (count == 0 ? "" : `(${count})`);
    qrname = path.join(qrFolder, teamname +" vs "+ match.vsTeam + ab + ".png"); // updating pdf name
  }
  console.log(qrname);
  // await fspromises.writeFile(qrname, ).catch((err)=>console.log(err));



  // load template pdf
  let templatePdfBytes = await fspromises.readFile(args.tpdf).catch((err)=>console.log(err));
  let pdfDoc = await pdflib.PDFDocument.load(templatePdfBytes);
  let form = pdfDoc.getForm(); // pdf-lib feature, pdf forms
  let t1namefield = form.getTextField('Team1');
  let t2namefield = form.getTextField('Team2');
  let t1scoreField = form.getTextField('Team1score');
  let t2scoreField = form.getTextField('Team2score');
  let resultField = form.getTextField('Result');
  let qrField = form.getButton('QrcodeImage'); // image render
  
  t1namefield.setText(teamname);
  t2namefield.setText(match.vsTeam);
  t1scoreField.setText(match.myScore);
  t2scoreField.setText(match.vsScore);
  resultField.setText(match.result);
  
  qrcreate(qrname, match, teamname);
  
  let qrimagepng/* in bytes */ = await fspromises.readFile(qrname).catch((err)=>console.log(err));
  // 👇🏻
  qrimagepng = await pdfDoc.embedPng(qrimagepng); // store it as a Node.js buffer in memory
  // 👇🏻
  qrField.setImage(qrimagepng);
  

  let pdfBytes = await pdfDoc.save();
  let pdfname = path.join(teamFolder, teamname +" vs "+ match.vsTeam + ".pdf");
  count = 0;
  while (fs.existsSync(pdfname)) { 
    count++;
    let ab = (count == 0 ? "" : `(${count})`);
    pdfname = path.join(teamFolder, teamname +" vs "+ match.vsTeam + ab + ".pdf"); // updating pdf name
  }
  await fspromises.writeFile(pdfname, pdfBytes).catch((err)=>console.log(err));

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