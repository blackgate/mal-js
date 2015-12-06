const readline = require('readline');
const prStr = require('./printer');
const readStr = require('./reader');
const types = require('./types');

var repl_env = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b
};

function $evalAST(ast, env) {
    if (ast instanceof types.MalSymbol)
        if (ast.name in env)
            return env[ast.name];
        else
            throw `Symbol ${ast.name} not found`;
    else if (ast instanceof Array)
        return ast.map(i => $eval(i, env));
    else
        return ast;
}

function $read (input) {
    return readStr(input);
}

function $eval (ast, env) {
    if (ast instanceof Array) {
        var evList = $evalAST(ast, env);
        return evList[0].apply(null, evList.splice(1));
    }
    else {
        return $evalAST(ast, env);
    }
}

function $print (res) {
    return prStr(res);
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
