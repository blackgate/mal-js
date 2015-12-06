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
                default:
                    var evList = $evalAST(ast, env);
                    var first = evList.shift();
                    if (first instanceof types.MalFunction) {
                        ast = first.ast;
                        env = new Env(first.env, first.params, evList);
                        continue;
                    } else {
                        return first.apply(null, evList);
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

recursiveAsyncReadLine();
