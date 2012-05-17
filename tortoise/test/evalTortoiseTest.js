if (typeof module !== 'undefined') {
    // In Node load required modules
    var assert = require('chai').assert;
    var expect = require('chai').expect;
    var PEG = require('pegjs');
    var fs = require('fs');
    var evalStatement = require('../eval').evalStatement;
    var evalExpr = require('../eval').evalExpr;
} else {
    // In browser assume already loaded by <script> tags
    var assert = chai.assert;
    var expect = chai.expect;
}

suite('statement', function() {
    test('variable definition', function() {
        var env = { bindings: {}};
        evalStatement({tag:'var', name:'x'}, env);
        assert.deepEqual(
            env,
            { bindings: { x: 0 } } 
        );
    });
    test('expression', function() {
        assert.deepEqual(
            evalStatement({tag:'ignore', body:15}, {}),
            15
        );
    });
    test('if', function() {
        assert.deepEqual(
            evalStatement({tag:'if', expr:{tag:'==', left:5, right:5}, body:[{tag:'ignore', body:15}]}, {}),
            15
        );
    });
    test('repeat', function() {
        var called = 0;
        var env = { bindings: { f: function() {
            called++;
        }}};
        evalStatement({tag:'repeat', expr:5, body:[{tag:'ignore', body:{tag:'call', name:'f', args:[]}}]}, env);
        assert.deepEqual(
            called,
            5
        );
    });
    test('define', function() {
        var env = { bindings: {} };
        evalStatement({tag:'define', name:'f', args:[], body:[]}, env);
        assert.deepEqual(
            typeof env.bindings.f,
            'function'
        );
    });
    test('if false', function() {
        assert.deepEqual(
            typeof evalStatement({tag:'if', expr:{tag:'==', left:5, right:4}, body:[{tag:'ignore', body:15}]}, {}),
            'undefined'
        );
    });
    test('variable assignment', function() {
        var env = { bindings: {x: 0}};
        evalStatement({tag:':=', left:'x', right:13}, env);
        assert.deepEqual(
            env,
            { bindings: { x: 13 } } 
        );
    });
});

suite('expression', function() {
    test('less than', function() {
        assert.deepEqual(
            evalExpr({tag:'<', left: 2, right: 3}, {}),
            true
        );
    });
    test('greater than', function() {
        assert.deepEqual(
            evalExpr({tag:'>', left: 2, right: 3}, {}),
            false
        );
    });
    test('addition', function() {
        assert.deepEqual(
            evalExpr({tag:'+', left: 2, right: 3}, {}),
            5
        );
    });
    test('identifier', function() {
        assert.deepEqual(
            evalExpr({tag:'ident', name: 'x'}, { bindings: { x: 2}}),
            2
        );
    });
    test('function call', function() {
        assert.deepEqual(
            evalExpr({tag:'call', name: 'f', args:[]}, { bindings: { f: function() { return 2; }}}),
            2
        );
    });
    test('function call with parameter', function() {
        assert.deepEqual(
            evalExpr({tag:'call', name: 'f', args:[2]}, { bindings: { f: function(x) { return x*3; }}}),
            6
        );
    });
});
