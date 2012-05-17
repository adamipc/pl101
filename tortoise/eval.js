if (typeof module !== 'undefined') {
    var PEG = require('pegjs');
    var fs = require('fs');
    var parseTortoise = PEG.buildParser(fs.readFileSync(
        'tortoise.peg', 'utf-8')).parse;
} else {
    var parseTortoise = TORTOISE.parse;
}

var evalTortoiseString = function(string, env) {
    return evalTortoise(parseTortoise(string), env);
};

var lookup = function (env, v) {
    if (typeof env.bindings[v] !== 'undefined') {
        return env.bindings[v];
    }
    
    return lookup(env.outer, v);
};

var update = function (env, v, val) {
    if (typeof env.bindings[v] !== 'undefined') {
        env.bindings[v]= val;
    } else {
        update(env.outer, v, val);
    }
};

var add_binding = function (env, v, val) {
    env.bindings[v] = val;
};

// Evaluate a Tortoise expression, return value
var evalExpr = function (expr, env) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }

    // Look at tag to see what to do
    switch (expr.tag) {
        // Simple built-in binary operations
        case '<':
            return  evalExpr(expr.left, env) <
                    evalExpr(expr.right, env);
        case '>':
            return  evalExpr(expr.left, env) >
                    evalExpr(expr.right, env);
        case '<=':
            return  evalExpr(expr.left, env) <=
                    evalExpr(expr.right, env);
        case '>=':
            return  evalExpr(expr.left, env) >=
                    evalExpr(expr.right, env);
        case '!=':
            return  evalExpr(expr.left, env) !==
                    evalExpr(expr.right, env);
        case '==':
            return  evalExpr(expr.left, env) ===
                    evalExpr(expr.right, env);
        case '*':
            return  evalExpr(expr.left, env) *
                    evalExpr(expr.right, env);
        case '/':
            return  evalExpr(expr.left, env) /
                    evalExpr(expr.right, env);
        case '+':
            return  evalExpr(expr.left, env) +
                    evalExpr(expr.right, env);
        case '-':
            return  evalExpr(expr.left, env) -
                    evalExpr(expr.right, env);
        case 'call':
            // Get function value
            var func = lookup(env, expr.name);
            // Evaluate arguments to pass
            var ev_args = [];
            for (var i = 0; i < expr.args.length; i++) {
                ev_args[i] = evalExpr(expr.args[i], env);
            }
            return func.apply(null, ev_args);
        case 'ident':
            return lookup(env, expr.name);
    }
};

var evalStatement = function (stmt, env) {
    var val;
    // Statements always have tags
    switch(stmt.tag) {
        // A single expression
        case 'ignore':
            // Just evaluate expression
            val = evalExpr(stmt.body, env);
            break;
        // Declare new variable
        case 'var':
            // New variable gets default value of 0
            add_binding(env, stmt.name, 0);
            val = 0;
            break;
        case ':=':
            val = evalExpr(stmt.right, env);
            update(env, stmt.left, val);
            break;
        case 'if':
            if (evalExpr(stmt.expr, env)) {
                val = evalStatements(stmt.body, env);
            }
            break;
        case 'repeat':
            var count = evalExpr(stmt.expr, env);
            for (var i = 0; i < count; i++) {
                val = evalStatements(stmt.body, env);
            }
            break;
        case 'define':
            var new_func = function() {
                var new_bindings;
                for (var i = 0; i < stmt.args.length; i++) {
                    new_bindings[stmt.args[i]] = arguments[i];
                }
                new_env = { bindings: new_bindings, outer: env };
                return evalStatements(stmt.body, new_env);
            };
            add_binding(env, stmt.name, new_func);
            val = 0;
            break;
    }

    return val;
};

var evalStatements = function (seq, env) {
    var val;
    for(var i = 0; i < seq.length; i++) {
        val = evalStatement(seq[i], env);
    }
    return val; 
};
// If we are used as Node module, export evalTortoise(String)
if (typeof module !== 'undefined') {
    module.exports.evalTortoise = evalTortoise;
    module.exports.evalTortoiseString = evalTortoiseString;
}
