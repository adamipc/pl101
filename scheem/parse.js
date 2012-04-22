var PEG = require('pegjs');
var assert = require('assert');
var fs = require('fs'); // for loading files

// Read file contents
var data = fs.readFileSync('scheem.peg', 'utf-8');
// Show the PEG grammar file
console.log(data);
// Create my parser
var parse = PEG.buildParser(data).parse;
// Do a test
assert.deepEqual( parse("(a b c)"), ["a", "b", "c"] );
assert.deepEqual( parse("(a (b) c)"), ["a", ["b"], "c"] );

// Tests for Quotes
assert.deepEqual( parse("(a '(b) c)"), ["a", ["quote", ["b"]], "c"] );

// Tests for Whitespace
assert.deepEqual( parse( "(a\n\t(b)\n\tc)"), ["a", ["b"], "c"] );
