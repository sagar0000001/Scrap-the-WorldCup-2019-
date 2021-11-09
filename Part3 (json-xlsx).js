let fs = require("fs");
let fspromises = fs.promises;
let path = require("path");
let minimist = require("minimist");
let args = minimist(process.argv);
let excel = require("excel4node");

async function run() {
  let sourcePath = path.join(args.sourceFolder, args.sourceFilename);
  let teamsJson = await fspromises.readFile(sourcePath, "utf-8").catch((err) => console.log(err));

  let teams = JSON.parse(teamsJson);

  let workbook = new excel.Workbook();
  // lets define header style
  let headerStyle = workbook.createStyle({
    font: {
      color: "#ffffff",
      size: 11
    },

    fill: {
      type: "pattern",
      patternType: "solid",
      fgcolor: "Grey"
    }
  });

  let thisTeamStyle = workbook.createStyle({
    font: {
      color: "#fefefe",
      size: 11
    },

    fill: {
      type: "pattern",
      patternType: "solid",
      fgcolor: "White"
    }
  });

  for (let i = 0; i < teams.length; i++) {
    let sheet = workbook.addWorksheet(teams[i].name);
    sheet.cell(1, 1).string("Vs-Team").style(headerStyle);
    sheet.cell(1, 2).string("Vs-Team Score").style(headerStyle);
    sheet.cell(1, 3).string(teams[i].name + " Scores").style(thisTeamStyle);
    sheet.cell(1, 4).string("Result").style(headerStyle);

    let matches = teams[i].matches;
    for (let j = 0; j < matches.length; j++) {
      sheet.cell(2 + j, 1).string(matches[j].vsTeam);
      sheet.cell(2 + j, 2).string(matches[j].vsScore);
      sheet.cell(2 + j, 3).string(matches[j].myScore);
      sheet.cell(2 + j, 4).string(matches[j].result);

    }


    let destPath = path.join(args.destFolder, "worldcup2019.csv");
    workbook.write(destPath);
  }

}

run();

/* ## Console
node Part3\ \(json-xlsx\).js --sourceFolder=JSONs --sourceFilename=teams.json --destFolder=Spreadsheet

*/