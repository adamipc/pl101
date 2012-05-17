if (typeof module !== 'undefined') {
    // In Node load required modules
    var assert = require('chai').assert;
    var expect = require('chai').expect;
    var PEG = require('pegjs');
    var fs = require('fs');
    var parseTortoise = PEG.buildParser(fs.readFileSync(
        'tortoise.peg', 'utf-8')).parse;
} else {
    // In browser assume already loaded by <script> tags
    var parseTortoise = TORTOISE.parse;
    var assert = chai.assert;
    var expect = chai.expect;
}

suite('numbers', function() {
    test('integer', function() {
        assert.deepEqual(
            parseTortoise("12", "number"),
            12
        );
    });
});

