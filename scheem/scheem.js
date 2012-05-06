if (typeof module !== 'undefined') {
    var PEG = require('pegjs');
    var fs = require('fs');
    var parseScheem = PEG.buildParser(fs.readFileSync(
        'scheem.peg', 'utf-8')).parse;
} else {
    var parseScheem = SCHEEM.parse;
};

var evalScheemString = function(string, env) {
    return evalScheem(parseScheem(string), env);
};

var lookup = function (env, v) {
    if (env.name === v) {
        return env.value;
    }

    if (typeof env.outer !== 'undefined') {
        return lookup(env.outer, v);
    } else {
        return initialEnvironment[v];
    }
};

var update = function (env, v, val) {
    if (env.name === v) {
        env.value = val;
    } else {
        if (typeof env.outer !== 'undefined') {
            update(env.outer, v, val);
        } else {
            if (typeof initialEnvironment[v] !== 'undefined') {
                initialEnvironment[v] = val;
            } else {
                throw "Variable " + v + " is not defined.";
            }
        }
    }
};

var add_binding = function (env, v, val) {
    env.outer = { name: env.name, value: env.value, outer: env.outer };
    env.name = v;
    env.value = val;
};

var initialEnvironment = {
'+': function(args) { return args.map(evalScheem).reduce(function(x, y) { return x + y; }, 0); }
};


var evalScheem = function (expr, env) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    if (typeof expr === 'string') {
        return lookup(env, expr);
    }

    // Look at head of list for operation
    switch (expr[0]) {
        case '-':
            var result = evalScheem(expr[1], env);
            for (var i = 2; i < expr.length; i++) {
                result -= evalScheem(expr[i], env);
            }
            return result;
        case '*':
            var result = evalScheem(expr[1], env);
            for (var i = 2; i < expr.length; i++) {
                result *= evalScheem(expr[i], env);
            }
            return result;
        case '/':
            var result = evalScheem(expr[1], env);
            for (var i = 2; i < expr.length; i++) {
                result /= evalScheem(expr[i], env);
            }
            return result;
        case '=':
            var eq = (evalScheem(expr[1], env) === 
                      evalScheem(expr[2], env));
            if (eq) return '#t';
            return '#f';
        case '<':
            var lessthan = (evalScheem(expr[1], env) <
                            evalScheem(expr[2], env));
            if (lessthan) return '#t';
            return '#f';
        case '>':
            var greaterthan = (evalScheem(expr[1], env) >
                               evalScheem(expr[2], env));
            if (greaterthan) return '#t';
            return '#f';
        case 'quote':
            if (expr.length > 2) {
                throw "Too many parameters to quote";
            }
            return expr[1];
        case 'begin':
            var result = 0;
            for(var i = 1; i < expr.length; i++) {
                result = evalScheem(expr[i], env);
            }
            return result;
        case 'define':
            if (typeof lookup(env, expr[1]) !== 'undefined') {
                throw "Variable already defined";
            }
            if (expr.length > 3) {
                throw "Too many parameters to define";
            }
            add_binding(env, expr[1], evalScheem(expr[2], env));
            return 0;
        case 'set!':
            if (typeof lookup(env, expr[1]) === 'undefined') {
                throw "Variable not yet defined";
            }
            if (expr.length > 3) {
                throw "Too many parameters to set!";
            }
            update(env, expr[1], evalScheem(expr[2], env)); 
            return 0;
        case 'let-one':
            return evalScheem(expr[3], { name: expr[1], value: evalScheem(expr[2]), outer: env});
        case 'lambda':
            return function (args) {
                var newenv = { name: env.name, value: env.value, outer: env.outer };
                for (var i = 0; i < args.length; i++) {
                    add_binding(newenv, expr[1][i], args[i]);
                }
                return evalScheem(expr[2], newenv);
            };
        case 'lambda-one':
            return function (args) {
                return evalScheem(expr[2], { name: expr[1], value: args[0], outer: env});
            };
        case 'if':
            if (evalScheem(expr[1], env) === '#t') {
                return evalScheem(expr[2], env);
            }
            return evalScheem(expr[3], env);
        case 'cons':
            var tail = evalScheem(expr[2], env);
            tail.unshift(evalScheem(expr[1], env)); 
            return tail;
        case 'car':
            if (expr.length > 2) {
                throw "Too many parameters to car";
            }
            var list = evalScheem(expr[1], env);
            if (list instanceof Array) {
                return evalScheem(expr[1], env)[0];
            }
            throw "Parameter to car is not a list";
        case 'cdr':
            if (expr.length > 2) {
                throw "Too many parameters to car";
            }
            var list = evalScheem(expr[1], env);
            list.shift();
            return list;
        default:
            var evaluatedArgs = expr.slice(1).map(function(expr) {
                return evalScheem(expr, env);
            });
            return (evalScheem(expr[0], env))(evaluatedArgs);
    }
};

// If we are used as Node module, export evalScheem
if (typeof module !== 'undefined') {
    module.exports.evalScheem = evalScheem;
    module.exports.evalScheemString = evalScheemString;
}
