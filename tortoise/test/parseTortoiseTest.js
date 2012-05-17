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

suite('statements', function() {
    test('assignment', function() {
        assert.deepEqual(
            parseTortoise("foo := 13;", "statement"),
            { tag:':=', left:'foo', right:13}
        );
    });
    test('variable introduction', function() {
        assert.deepEqual(
            parseTortoise("var foo;", "statement"),
            { tag:'var', name:'foo'}
        );
    });
    test('if', function() {
        assert.deepEqual(
            parseTortoise("if (foo) { bar; }", "statement"),
            { tag:'if', expr:{tag:'ident', name:'foo'}, body:[{tag:'ignore', body:{tag:'ident', name:'bar'}}]}
        );
    });
});

suite('expressions', function() {
    test('add two numbers', function() {
        assert.deepEqual(
            parseTortoise("12.03 + -13", "expression"),
            { tag:'+', left:12.03, right:-13}
        );
    });
    test('subtract two identifiers', function() {
        assert.deepEqual(
            parseTortoise("_foo13 - bar_baz", "expression"),
            { tag:'-', left:{tag:'ident', name:'_foo13'}, right:{tag:'ident', name:'bar_baz'}}
        );
    });
    test('multiply and divide', function() {
        assert.deepEqual(
            parseTortoise("1 * -2 / 0.4", "expression"),
            { tag:'*', left:1, right:{tag:'/', left:-2, right:0.4}}
        );
    });
    test('precidence', function() {
        assert.deepEqual(
            parseTortoise("1 * -2 + 0.4", "expression"),
            { tag:'+', left:{tag:'*', left:1, right:-2}, right:0.4}
        );
    });
    test('parentheses', function() {
        assert.deepEqual(
            parseTortoise("1 * (-2 + 0.4)", "expression"),
            { tag:'*', left:1, right:{tag:'+', left:-2, right:0.4}}
        );
    });
    test('function without parameters', function() {
        assert.deepEqual(
            parseTortoise("_foo13()", "expression"),
            { tag:'call', name:'_foo13', args:[]}
        );
    });
    test('function with parameters', function() {
        assert.deepEqual(
            parseTortoise("_foo13(bar)", "expression"),
            { tag:'call', name:'_foo13', args:[{tag:'ident', name:'bar'}]}
        );
    });
    test('function with multiple parameters', function() {
        assert.deepEqual(
            parseTortoise("_foo13(bar,-13.4)", "expression"),
            { tag:'call', name:'_foo13', args:[{tag:'ident', name:'bar'},-13.4]}
        );
    });
});

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

