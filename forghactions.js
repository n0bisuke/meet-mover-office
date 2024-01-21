const fs = require('node:fs');

const log = fs.readFileSync('./log.json', 'utf-8');
const logJson = JSON.parse(log);

console.log(`result: ${logJson.result.msg}`);