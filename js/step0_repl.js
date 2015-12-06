var readline = require('readline');

function $read (input) {
    return input;
}

function $eval (code) {
    return code;
}

function $print (res) {
    return res;
}

function $rep (input) {
    return $print($eval($read(input)))
}

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

var recursiveAsyncReadLine = function () {
    rl.question('user> ', function (answer) {
        console.log($rep(answer));
        recursiveAsyncReadLine();
    });
};

recursiveAsyncReadLine();
