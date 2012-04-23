var PEG = require('pegjs');
var assert = require('assert');
var fs = require('fs'); // for loading files

// Read file contents
var data = fs.readFileSync('mus.peg', 'utf-8');
// Show the PEG grammar file
console.log(data);
// Create my parser
var parse = PEG.buildParser(data).parse;

var muslist = fs.readFileSync('test.mus', 'utf-8');

console.log(parse(muslist));
