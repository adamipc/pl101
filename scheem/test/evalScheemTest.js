if (typeof module !== 'undefined') {
    // In Node load required modules
    var assert = require('chai').assert;
    var evalScheem = require('../scheem').evalScheem;
} else {
    // In browser assume already loaded by <script> tags
    var assert = chai.assert;
}

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
});
suite('environment', function() {
    test('define', function() {
        var env = {y: 1};
        evalScheem(['define', 'x', 3], env);
        assert.deepEqual(
            env,
            {x: 3, y: 1}
        );
    });
    test('set!', function() {
        var env = {x: 4, y: 1};
        evalScheem(['set!', 'x', 3], env);
        assert.deepEqual(env,
            {x: 3, y: 1}
        );
    });
    test('set! expression', function() {
        var env = {x: 4, y: 1};
        evalScheem(['set!', 'x', ['+', 1, 2]], env);
        assert.deepEqual(env,
            {x: 3, y: 1}
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
        var env = {x: 4};
        evalScheem(['begin', ['set!', 'x', 3]], env);
        assert.deepEqual(
            env,
            {x: 3}
        );
    });
    test('track environment', function() {
        var env = {x: 4};
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
    test('subtract', function() {
        assert.deepEqual(
            evalScheem(['-', 1, 2], {}),
            -1 
        );
    });
    test('multiply', function() {
        assert.deepEqual(
            evalScheem(['*', 3, 2], {}),
            6 
        );
    });
    test('divide', function() {
        assert.deepEqual(
            evalScheem(['/', 12, 3], {}),
            4 
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
