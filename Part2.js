// matches.json -> teams.json

// let axios = require("axios").default;

let minimist = require("minimist");
let args = minimist(process.argv);
// let jsdom = require("jsdom");
let fs = require("fs");
let path = require("path");

async function run() {

  let matchesJsonPath = path.join(args.JSONFolder, "matches.json");
  let fsPromises = fs.promises;
  let matchesJson = await fsPromises.readFile(matchesJsonPath, "utf-8").catch(function(err){ console.log('Failed to read file', err)});

  let teams = []; // js obj
  let matches = JSON.parse(matchesJson);

  for(let i=0; i<matches.length; i++) {
    let t1name = matches[i].t1name;
    let t2name = matches[i].t2name;
    let t1score = matches[i].t1score;
    let t2score = matches[i].t2score;
    let result = matches[i].result;

    // for t1 team
    let ifTeam1Found = false;
    for(let j=0; j<teams.length; j++) { // search for t1name
      if(teams[j].name == t1name) {
        ifTeam1Found = true;
        let newMatch = {
          vsTeam : t2name,
          myScore : t1score,
          vsScore : t2score,
          result : result
        }
        teams[j].matches.push(newMatch);
      }
    }
    if(!ifTeam1Found) {
      teams.push({
        name : t1name,
        matches : [{
          vsTeam : t2name,
          myScore : t1score,
          vsScore : t2score,
          result : result
        }]
      })
    }
    
    // for t2 team
    let ifTeam2Found = false;
    for(let j=0; j<teams.length; j++) { // search for t1name
      if(teams[j].name == t2name) {
        ifTeam2Found = true;
        let newMatch = {
          vsTeam : t1name,
          myScore : t2score,
          vsScore : t1score,
          result : result
        }
        teams[j].matches.push(newMatch);
      }
    }
    if(!ifTeam2Found) {
      teams.push({
        name : t2name,
        matches : [{
          vsTeam : t1name,
          myScore : t2score,
          vsScore : t1score,
          result : result
        }]
      })
    }
  }

  let teamsJson = JSON.stringify(teams);
  let writeFilePath = path.join(args.JSONFolder, 'teams.json');
  await fsPromises.writeFile(writeFilePath , teamsJson, "utf-8").catch((err)=> console.log(err));

}

run();


/* 
node Part2.js --JSONFolder=JSONs



aaj kya sikha
ctrl + window_number
to focus on splitted windos in vscode
like- ctrl+1

*/


