if (typeof module !== 'undefined') {
    var PEG = require('pegjs');
    var fs = require('fs');
    var parseScheem = PEG.buildParser(fs.readFileSync(
        'scheem.peg', 'utf-8')).parse;
} else {
    var parseScheem = SCHEEM.parse;
};

evalScheemString = function(string, env) {
    return evalScheem(parseScheem(string), env);
};

evalScheem = function (expr, env) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    if (typeof expr === 'string') {
        return env[expr];
    }

    // Look at head of list for operation
    switch (expr[0]) {
        case '+':
            return evalScheem(expr[1], env) +
                   evalScheem(expr[2], env);
        case '-':
            return evalScheem(expr[1], env) -
                   evalScheem(expr[2], env);
            return;
        case '*':
            return evalScheem(expr[1], env) *
                   evalScheem(expr[2], env);
            return;
        case '/':
            return evalScheem(expr[1], env) /
                   evalScheem(expr[2], env);
            return;
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
            return expr[1];
        case 'begin':
            var result = 0;
            for(var i = 1; i < expr.length; i++) {
                result = evalScheem(expr[i], env);
            }
            return result;
        case 'define':
        case 'set!':
            env[expr[1]] = evalScheem(expr[2], env); 
            return 0;
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
            return evalScheem(expr[1], env)[0];
        case 'cdr':
            var list = evalScheem(expr[1], env);
            list.shift();
            return list;
    }
};

// If we are used as Node module, export evalScheem
if (typeof module !== 'undefined') {
    module.exports.evalScheem = evalScheem;
    module.exports.evalScheemString = evalScheemString;
}
