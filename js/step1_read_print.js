var readline = require('readline');
var prStr = require('./printer');
var readStr = require('./reader');

function $read (input) {
    return readStr(input);
}

function $eval (code) {
    return code;
}

function $print (res) {
    return prStr(res);
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
