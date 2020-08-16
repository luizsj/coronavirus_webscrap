countryData = require("./countryData");
calcProjection = require("./calcProjections");

const NumCountries = 20;

//construct an object to force some data of Brazil
//      oficial data sometimes have distorcions
//          caused by difficulties of a state to put daily data on federal system
     
const forceData = new Object();
let cases = new Object();
let deaths = new Object();
//      2020-07-28: State São Paulo not publish data, acumulating to next day
let dateWithCorrection = new Date(2020, 6, 28, 0, 0, 0, 0); //28/07/2020
cases[dateWithCorrection] = 55066;
deaths[dateWithCorrection] = 1338;
dateWithCorrection = new Date(2020, 6, 29, 0, 0, 0, 0); //28/07/2020
cases[dateWithCorrection] = 56972;
deaths[dateWithCorrection] = 1171;

//      2020-08-08: State Paraná not publish data, acumulating to next day
dateWithCorrection = new Date(2020, 7, 8, 0, 0, 0, 0); //28/07/2020
cases[dateWithCorrection] = 44756;
deaths[dateWithCorrection] = 893;
dateWithCorrection = new Date(2020, 7, 9, 0, 0, 0, 0); //28/07/2020
cases[dateWithCorrection] = 23762;
deaths[dateWithCorrection] = 541;

forceData.cases = cases;
forceData.deaths = deaths;
console.log('forceData in index.js before getCountryData');
console.log(forceData);


let countriesList = countryData.getCountryData(NumCountries, forceData);

let daysToCalc = 120;
PrintList.PrintListBrazil(countriesList, 30);
countriesList = calcProjection.calculateProjections(countriesList, daysToCalc);

console.log('-----------================-------');
PrintList.PrintListBrazil(countriesList, daysToCalc);
//

console.log('------------------');
PrintList.PrintList(countriesList, false);