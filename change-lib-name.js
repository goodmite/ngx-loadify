const fs  = require('fs');
const path  = require('path');
// const pathToPackageJson = path.join('dist','libs','designer2','package.json');
const pathToPackageJson = path.join('projects','http-tracker-lib','package.json');
const packageJSONStr = fs.readFileSync(pathToPackageJson).toString();
const packageJSONObj = JSON.parse(packageJSONStr);
packageJSONObj.version = bumpVersion(packageJSONObj.version);
fs.writeFileSync(pathToPackageJson, JSON.stringify(packageJSONObj));

function bumpVersion(versionStr) {
  return versionStr.split(".").map((value, index)=>{
    if(index === 2){
      return Number(value) + 1;
    }
    return value
  }).join('.')


}
