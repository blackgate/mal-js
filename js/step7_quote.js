const readline = require('readline');
const prStr = require('./printer');
const readStr = require('./reader');
const types = require('./types');
const Env = require('./env');
const core = require('./core');

var repl_env = new Env();

for (var k in core.ns) {
    repl_env.set(k, core.ns[k]);
}

repl_env.set("eval", function (ast) {
    return $eval(ast, repl_env);
});

function $evalAST(ast, env) {
    if (ast instanceof types.MalSymbol)
        return env.get(ast.name);
    else if (ast instanceof Array)
        return ast.map(i => $eval(i, env));
    else
        return ast;
}

function $read (input) {
    return readStr(input);
}

function isPair(val) {
    return val instanceof Array && val.length > 0;
}

function quasiquote(ast) {
    if (!isPair(ast)) {
        return [new types.MalSymbol("quote"), ast];
    } else if (ast[0] instanceof types.MalSymbol && ast[0].name === "unquote") {
        return ast[1];
    } else if (isPair(ast[0]) && ast[0][0] instanceof types.MalSymbol &&
        ast[0][0].name === "splice-unquote") {
        return [new types.MalSymbol("concat"), ast[0][1], quasiquote(ast.slice(1))];
    } else {
        return [new types.MalSymbol("cons"), quasiquote(ast[0]), quasiquote(ast.slice(1))];
    }
}

function $eval (ast, env) {
    while (true) {
        if (ast instanceof Array) {
            switch (ast[0].name) {
                case "def!":
                    return env.set(ast[1].name, $eval(ast[2], env));
                case "let*":
                    var newEnv = new Env(env);
                    for (var i = 0 ; i < ast[1].length ; i += 2) {
                        newEnv.set(ast[1][i].name, $eval(ast[1][i + 1], newEnv));
                    }
                    ast = ast[2];
                    env = newEnv;
                    continue;
                case "do":
                    var items = ast.slice(1);
                    var last = items.pop();
                    var res = $evalAST(items, env);
                    ast = last;
                    continue;
                case "if":
                    var res = $eval(ast[1], env);
                    if (res === false || res === null)
                        ast = ast[3] || null;
                    else
                        ast = ast[2];
                    continue;
                case "fn*":
                    var binds = ast[1].map(b => b.name);
                    return new types.MalFunction(ast[2], binds, env, function () {
                        return $eval(ast[2], new Env(env, binds, arguments));
                    });
                case "quote":
                    return ast[1];
                case "quasiquote":
                    ast = quasiquote(ast[1]);
                    continue;
                default:
                    var evList = $evalAST(ast, env);
                    var first = evList[0], rest = evList.slice(1);
                    if (first instanceof types.MalFunction) {
                        ast = first.ast;
                        env = new Env(first.env, first.params, rest);
                        continue;
                    } else {
                        return first.apply(null, rest);
                    }
            }
        }
        else {
            return $evalAST(ast, env);
        }
    }
}

function $print (res) {
    return prStr(res, true);
}

function $rep (input) {
    return $print($eval($read(input), repl_env))
}

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

var recursiveAsyncReadLine = function () {
    rl.question('user> ', function (answer) {
        try {
            console.log($rep(answer));
        }
        catch (ex) {
            console.log("Error:", ex);
        }

        recursiveAsyncReadLine();
    });
};

$rep('(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) ")")))))');

recursiveAsyncReadLine();
