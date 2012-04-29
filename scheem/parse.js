var PEG = require('pegjs');
var assert = require('chai').assert;
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
assert.deepEqual( parse("(1 (2) 32)"), [1, [2], 32] );

// Tests for Quotes
assert.deepEqual( parse("(a '(b) c)"), ["a", ["quote", ["b"]], "c"] );

// Tests for Whitespace
assert.deepEqual( parse( "(a\n\t(b)\n\tc)"), ["a", ["b"], "c"] );

// Tests for comments
assert.deepEqual( parse( ";; foo\n(a\n;; bar\n\t(b) ;; baz\n\tc) ;; flub"), ["a", ["b"], "c"] );
