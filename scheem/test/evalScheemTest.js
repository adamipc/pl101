if (typeof module !== 'undefined') {
    // In Node load required modules
    var assert = require('chai').assert;
    var expect = require('chai').expect;
    var PEG = require('pegjs');
    var fs = require('fs');
    var evalScheem = require('../scheem').evalScheem;
    var evalScheemString = require('../scheem').evalScheemString;
    var parseScheem = PEG.buildParser(fs.readFileSync(
        'scheem.peg', 'utf-8')).parse;
} else {
    // In browser assume already loaded by <script> tags
    var parseScheem = SCHEEM.parse;
    var assert = chai.assert;
    var expect = chai.expect;
}

suite('lambda-one', function() {
    test('anonymous identity', function() {
        assert.deepEqual(
            evalScheem([['lambda-one', 'x', 'x'], 5], {}),
            5
        );
    });
    test('anonymous plus one', function() {
        assert.deepEqual(
            evalScheem([['lambda-one', 'x', ['+', 1, 'x']], 5], {}),
            6
        );
    });
});

suite('lambda', function() {
    test('anonymous identity', function() {
        assert.deepEqual(
            evalScheem([['lambda', ['x'], 'x'], 5], {}),
            5
        );
    });
    test('anonymous plus one', function() {
        assert.deepEqual(
            evalScheem([['lambda', ['x'], ['+', 1, 'x']], 5], {}),
            6
        );
    });
    test('anonymous add', function() {
        assert.deepEqual(
            evalScheem([['lambda', ['x', 'y'], ['+', 'y', 'x']], 5, 2], {}),
            7
        );
    });
    test('as a parameter', function() {
        assert.deepEqual(
            evalScheem([['lambda', ['func'], ['func', 5]], ['lambda', ['x'], 'x']], {}),
            5
        );
    });
    test('define and call add', function() {
        assert.deepEqual(
            evalScheem(['begin', ['define', 'add', ['lambda', ['x', 'y'], ['+', 'y', 'x']]], ['add', 1, 2]], {}),
            3
        );
    });
    test('define and recurse', function() {
        assert.deepEqual(
            evalScheem(['begin', ['define', 'recurse', ['lambda', ['x'], ['if', ['=', 'x', 1], 0, ['recurse', 1]]]], ['recurse', ,2]], {}),
            0 
        );
    });
    test('inner value', function() {
        assert.deepEqual(
            evalScheem(['begin', ['define', 'foo', ['lambda', ['n'], ['lambda', ['i'], ['begin', ['set!', 'n', ['+', 'n', 'i'], 'n']]]]], ['define', 'bar', ['foo', 7]], ['bar', 5], ['bar', 3]], {}),
            15 
        );
    });
    test('fibonacci', function() {
        assert.deepEqual(
            evalScheem(['begin', ['define', 'fib', ['lambda', ['n'], ['if', ['<', 'n', 2], 'n', ['+', ['fib', ['-', 'n', 1]], ['fib', ['-', 'n', 2]]]]]], ['fib', 10]], {}),
            55 
        );
    });
});

suite('let-one', function() {
    test('basic', function() {
        assert.deepEqual(
            evalScheem(['let-one', 'x', 2, 'x'], {}),
            2
        );
    });
    test('redefine', function() {
        var env = {name: 'x', value: 1};
        assert.deepEqual(
            evalScheem(['let-one', 'x', 2, 'x'], env),
            2
        );
    });
});

suite('function application', function() {
    test('basic', function() {
        var plusone = function (args) { return args[0] + 1; };
        var env = {name: 'plusone', value: plusone};
        assert.deepEqual(
            evalScheem(['plusone', 2], env),
            3
        );
    });
    test('no args', function() {
        var five = function () { return 5; }
        var env = {name: 'five', value: five};
        assert.deepEqual(
            evalScheem(['five'], env),
            5
        );
    });
    test('multiple argument', function() {
        var plus = function (args) { return args[0] + args[1]; };
        var env = {name: 'plus', value: plus};
        assert.deepEqual(
            evalScheem(['plus', 2, 3], env),
            5
        );
    });
    test('undefined', function() {
        expect(function () {
            evalScheem(['notdefined', 2], env)
        }).to.throw();
    });
});

suite('quote', function() {
    test('a number', function() {
        assert.deepEqual(
            evalScheem(['quote', 3], {}),
            3
        );
    });
    test('an atom', function() {
        assert.deepEqual(
            evalScheem(['quote', 'dog'], {}),
            'dog'
        );
    });
    test('a list', function() {
        assert.deepEqual(
            evalScheem(['quote', [1, 2, 3]], {}),
            [1, 2, 3]
        );
    });
    test('too many parameters', function() {
        expect(function () {
            evalScheem(['quote', [1], 2], {});
        }).to.throw();
    });
});
suite('cons', function() {
    test('a number', function() {
        assert.deepEqual(
            evalScheem(['cons', 1, ['quote', [2, 3]]], {}),
            [1, 2, 3]
        );
    });
    test('a list', function() {
        assert.deepEqual(
            evalScheem(['cons', ['quote', [1, 2]], ['quote', [2, 3]]], {}),
            [[1, 2], 2, 3]
        );
    });
});
suite('car', function() {
    test('a list', function() {
        assert.deepEqual(
            evalScheem(['car', ['quote', [[2, 3], 3, 4]]], {}),
            [2, 3]
        );
    });
    test('a number', function() {
        assert.deepEqual(
            evalScheem(['car', ['quote', [1, 2]]], {}),
            1
        );
    });
    test('too many parameters', function() {
        expect(function () {
            evalScheem(['car', ['quote', [1, 2]], 3], {});
        }).to.throw();
    });
    test('non list', function() {
        expect(function () {
            evalScheem(['car', 1], {});
        }).to.throw();
    });
});
suite('cdr', function() {
    test('a list', function() {
        assert.deepEqual(
            evalScheem(['cdr', ['quote', [1, 3, 4]]], {}),
            [3, 4]
        );
    });
    test('an empty list', function() {
        assert.deepEqual(
            evalScheem(['cdr', ['quote', [1]]], {}),
            []
        );
    });
    test('too many parameters', function() {
        expect(function () {
            evalScheem(['cdr', ['quote', [1, 2]], 3], {});
        }).to.throw();
    });
    test('non list', function() {
        expect(function () {
            evalScheem(['cdr', 3], {});
        }).to.throw();
    });
});
suite('environment', function() {
    test('define', function() {
        var env = {name: 'y', value: 1};
        evalScheem(['define', 'x', 3], env);
        assert.deepEqual(
            env,
            {name: 'x', value: 3, outer: { name: 'y', value: 1, outer: undefined}}
        );
    });
    test('define already defined', function() {
        expect(function () {
            evalScheem(['define', 'x', 3], {name: 'x', value: 5});
        }).to.throw();
    });
    test('define too many parameters', function() {
        expect(function () {
            evalScheem(['define', 'x', 3, 4], {});
        }).to.throw();
    });
    test('set!', function() {
        var env = {name: 'x', value: 4};
        evalScheem(['set!', 'x', 3], env);
        assert.deepEqual(env,
            {name: 'x', value: 3}
        );
    });
    test('set! too many parameters', function() {
        expect(function () {
            evalScheem(['set!', 'x', 3, 4], {});
        }).to.throw();
    });
    test('set! not yet defined', function() {
        expect(function () {
            evalScheem(['set!', 'x', 3], {});
        }).to.throw();
    });
    test('set! expression', function() {
        var env = {name: 'x', value: 4};
        evalScheem(['set!', 'x', ['+', 1, 2]], env);
        assert.deepEqual(env,
            {name: 'x', value: 3}
        );
    });
});
suite('begin', function() {
    test('a number', function() {
        assert.deepEqual(
            evalScheem(['begin', 1, 2, 3], {}),
            3
        );
    });
    test('an expression', function() {
        assert.deepEqual(
            evalScheem(['begin', 1, 2, ['+', 3, 4]], {}),
            7
        );
    });
    test('change environment', function() {
        var env = {name: 'x', value: 4};
        evalScheem(['begin', ['set!', 'x', 3]], env);
        assert.deepEqual(
            env,
            {name: 'x', value: 3}
        );
    });
    test('track environment', function() {
        var env = {name: 'x', value: 4};
        assert.deepEqual(evalScheem(['begin', ['set!', 'x', 3], ['+', 'x', 2]], env),
            5
        );
    });
});
suite('math', function() {
    test('add', function() {
        assert.deepEqual(
            evalScheem(['+', 1, 2], {}),
            3
        );
    });
    test('add variable', function() {
        assert.deepEqual(
            evalScheem(['begin', ['define', 'x', 1], ['+', 'x', 2]], {}),
            3
        );
    });
    test('add single', function() {
        assert.deepEqual(
            evalScheem(['+', 1], {}),
            1
        );
    });
    test('add multiple', function() {
        assert.deepEqual(
            evalScheem(['+', 1, 2, 3], {}),
            6
        );
    });
    test('subtract', function() {
        assert.deepEqual(
            evalScheem(['-', 1, 2], {}),
            -1 
        );
    });
    test('subtract single', function() {
        assert.deepEqual(
            evalScheem(['-', 1], {}),
            1
        );
    });
    test('subtract multiple', function() {
        assert.deepEqual(
            evalScheem(['-', 12, 2, 3], {}),
            7
        );
    });
    test('multiply', function() {
        assert.deepEqual(
            evalScheem(['*', 3, 2], {}),
            6 
        );
    });
    test('multiply single', function() {
        assert.deepEqual(
            evalScheem(['*', 3], {}),
            3
        );
    });
    test('multiply multiple', function() {
        assert.deepEqual(
            evalScheem(['*', 2, 3, 4], {}),
            24
        );
    });
    test('divide', function() {
        assert.deepEqual(
            evalScheem(['/', 12, 3], {}),
            4 
        );
    });
    test('divide single', function() {
        assert.deepEqual(
            evalScheem(['/', 3], {}),
            3
        );
    });
    test('divide multiple', function() {
        assert.deepEqual(
            evalScheem(['/', 24, 3, 4], {}),
            2
        );
    });
});
suite('equality', function() {
    test('equal', function() {
        assert.deepEqual(
            evalScheem(['=', 2, 2], {}),
            '#t'
        );
    });
    test('not equal', function() {
        assert.deepEqual(
            evalScheem(['=', 1, 2], {}),
            '#f'
        );
    });
    test('less than', function() {
        assert.deepEqual(
            evalScheem(['<', 2, 3], {}),
            '#t' 
        );
    });
    test('not less than', function() {
        assert.deepEqual(
            evalScheem(['<', 12, 3], {}),
            '#f' 
        );
    });
    test('not greater than', function() {
        assert.deepEqual(
            evalScheem(['>', 2, 3], {}),
            '#f' 
        );
    });
    test('greater than', function() {
        assert.deepEqual(
            evalScheem(['>', 12, 3], {}),
            '#t' 
        );
    });
});

suite('parse', function() {
    test('atoms', function() {
        assert.deepEqual(
            parseScheem("(a b c)"),
            ["a", "b", "c"]
        );
    });
    test('nested atoms', function() {
        assert.deepEqual(
            parseScheem("(a (b) c)"),
            ["a", ["b"], "c"]
        );
    });
    test('numbers', function() {
        assert.deepEqual(
            parseScheem("(1 (2) 32)"),
            [1, [2], 32]
        );
    });
    test('quoted list', function() {
        assert.deepEqual(
            parseScheem("(a '(b d) c)"),
            ["a", ["quote", ["b", "d"]], "c"]
        );
    });
    test('quoted atom', function() {
        assert.deepEqual(
            parseScheem("(a 'b c)"),
            ["a", ["quote", "b"], "c"]
        );
    });
    test('whitespace', function() {
        assert.deepEqual(
            parseScheem("(a\n\t(b)\n\t c)"),
            ["a", ["b"], "c"]
        );
    });
    test('comments', function() {
        assert.deepEqual(
            parseScheem("; foo\n(a\n; bar\n\t(b) ; baz\n\tc) ; flub"),
            ["a", ["b"], "c"]
        );
    });
});
suite('eval string', function() {
    test('add', function() {
        assert.deepEqual(
            evalScheemString("(+ 1 2)", {}),
            3
        );
    });
    test('begin', function() {
        assert.deepEqual(
            evalScheemString("(begin (define x 5) (+ x 2))", {}),
            7
        );
    });
});
