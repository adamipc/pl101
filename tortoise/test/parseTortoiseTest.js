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
    test('without whole', function() {
        expect(function () {
            parseTortoise(".03", "number")
        }).to.throw();
    });
    test('negative without whole', function() {
        expect(function () {
            parseTortoise("-.03", "number")
        }).to.throw();
    });
    test('float', function() {
        assert.deepEqual(
            parseTortoise("12.03", "number"),
            12.03
        );
    });
    test('negative float', function() {
        assert.deepEqual(
            parseTortoise("-12.03", "number"),
            -12.03
        );
    });
    test('negative integer', function() {
        assert.deepEqual(
            parseTortoise("-12", "number"),
            -12
        );
    });
    test('integer', function() {
        assert.deepEqual(
            parseTortoise("12", "number"),
            12
        );
    });
});

suite('identifiers', function() {
    test('first char digit', function() {
        expect(function () {
            parseTortoise("7foo", "identifier")
        }).to.throw();
    });
    test('invalid char', function() {
        expect(function () {
            parseTortoise("foo-bar", "identifier")
        }).to.throw();
    });
    test('letters numbers underscore', function() {
        assert.deepEqual(
            parseTortoise("foo93_bar", "identifier"),
            "foo93_bar"
        );
    });
    test('beginning underscore', function() {
        assert.deepEqual(
            parseTortoise("_foo13bar", "identifier"),
            "_foo13bar"
        );
    });
});

