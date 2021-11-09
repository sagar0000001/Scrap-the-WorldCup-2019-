// Upto Matches.json


// http request
let axios = require("axios").default;

let minimist = require("minimist");
let args = minimist(process.argv);
let jsdom = require("jsdom");
let fs = require("fs");
let path = require("path");



/* // code-1 
let httpRequestPromise = axios.get(args.source);
httpRequestPromise.then(function (response) {
  let html = response.data;
  let dom = new jsdom.JSDOM(html);
  let document = dom.window.document;

  let matches = []; // json ke liye object

  let matchesDiv = document.querySelectorAll(".team-scores-page .match-info");
  console.log(matchesDiv.length);


}).catch(function (err) {
  console.log(err);
})
 */

/* Code-1 repeat
*/

async function run() {
  let response = await axios.get(args.source);
  let html = response.data;

  let document = new jsdom.JSDOM(html).window.document;
  let matchesDiv = document.querySelectorAll(".team-scores-page .match-info");

  let matches = []; // Json= array of objects(js obj)

  for(let i=0; i<matchesDiv.length; i++) {
    // match=ith
    let match = {

    }

    let matchDescriptionBlk = matchesDiv[i].querySelector(".description");
    match.description = matchDescriptionBlk.textContent;
    
    let teams = matchesDiv[i].querySelectorAll(".name"); // 2 teams/match
    match.t1name = teams[0].textContent;
    match.t2name = teams[1].textContent;
    
    let scores =matchesDiv[i].querySelectorAll(".score"); // teams scoring [0-2]/match
    if(scores.length == 0) {
      // match cancelled
      match.t1score = "";
      match.t2score = "";
    }
    else if(scores.length==1) {
      // only 1 team played -> 2nd team's turn not came
      match.t1score = scores[0].textContent;
      match.t2score = "";
    }
    else {
      match.t1score = scores[0].textContent;
      match.t2score = scores[1].textContent;
    }
    
    let resultBlk = matchesDiv[i].querySelector(".status-text > span");
    match.result = resultBlk.textContent;
    

    matches.push(match);
  }

  let matchesJson = JSON.stringify(matches);
  
  if (fs.existsSync(args.folder)) { // deletes the destination-folder if exists
    fs.rmdirSync(args.folder, {recursive: true})
  }
  
  await fs.mkdir(args.folder, function(err) {
    console.log(err);
  });
  
  let filepath = path.join(args.folder, "matches.json"); // Matches\teams.json
  
  // await fs.writeFile(filepath, matchesJson, function(err) {
  //   console.log(err);
  // })

  let fspromises = fs.promises;
  await fspromises.writeFile(filepath, matchesJson, "utf-8").catch((err)=> console.log(err));
  
}

run();



/*
npm i axios
npm i minimist
node Part1.js --source=https://www.espncricinfo.com/series/icc-cricket-world-cup-2019-1144415/match-results --folder=JSONs
*/

/* जहां जहां मै फसा हूँ
axios require-> File is a CommonJS module; it may be converted to an ES6 module.
we do-> require("axios").default;

to view every npm library installed in this folder-> npm list

Jump to previous navigation -> Alt + ⬅

Go to bracket pair part -> ctrl + shift + \
split -> ctrl + \


*/