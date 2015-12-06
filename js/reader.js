var MalSymbol = require('./types').MalSymbol;

function Reader(tokens) {
    this.tokens = tokens;
    this.pos = 0;
}

Reader.prototype.next = function () {
    return this.tokens[++this.pos];
}

Reader.prototype.peek = function () {
    return this.tokens[this.pos];
}

function readAtom(reader) {
    var token = reader.peek();
    if (token[0] === '"' || /^(\d+(?:\.\d+)?|true|false)$/.test(token))
        return JSON.parse(token);
    else if (token === "nil")
        return null;
    else
        return new MalSymbol(token);
}

function readList(reader) {
    var res = [], token;
    while (token = reader.next()) {
        if (token == ")") return res;
        res.push(readForm(reader));
    }
    throw "EOF while reading";
}

function readForm(reader) {
    var token = reader.peek();

    if (token[0] == "(") return readList(reader);

    switch (token) {
        case "'":
            reader.next();
            return [new MalSymbol("quote"), readForm(reader)];
        case "`":
            reader.next();
            return [new MalSymbol("quasiquote"), readForm(reader)];
        case "~":
            reader.next();
            return [new MalSymbol("unquote"), readForm(reader)];
        case "~@":
            reader.next();
            return [new MalSymbol("splice-unquote"), readForm(reader)];
        default:
            return readAtom(reader);

    }
}

function tokenizer(input) {
    var tokens = [], token, re = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"|;.*|[^\s\[\]{}('"`,;)]*)/g;
    while ((token = re.exec(input)[1]) != '') {
        if (token[0] == ";") continue;
        tokens.push(token);
    }
    return tokens;
}

module.exports = function readStr(input) {
    var reader = new Reader(tokenizer(input));
    return readForm(reader);
}
