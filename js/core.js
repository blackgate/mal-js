const readStr = require('./reader');
const prStr = require('./printer');
const types = require('./types');
const fs = require('fs');

function isEqual(a, b) {
    if (a instanceof Array && b instanceof Array) {
        if (a.length !== b.length) return false;
        for (var i = 0 ; i < a.length ; i++) {
            if (!isEqual(a[i], b[i])) return false;
        }
        return true;
    } else if (a instanceof types.MalSymbol && b instanceof types.MalSymbol) {
        return a.name === b.name;
    } else {
        return a === b;
    }
}

module.exports = {
    ns: {
        "+": (a, b) => a + b,
        "-": (a, b) => a - b,
        "*": (a, b) => a * b,
        "/": (a, b) => a / b,
        "list": function () {
            return Array.prototype.slice.call(arguments);
        },
        "list?": (item) => item instanceof Array,
        "empty?": (list) => list === null || list.length == 0,
        "count": (list) => list !== null ? list.length : 0,
        "=": isEqual,
        "<": (a, b) => a < b,
        "<=": (a, b) => a <= b,
        ">": (a, b) => a > b,
        ">=": (a, b) => a >= b,
        "pr-str": function () {
            return Array.prototype.map.call(arguments, s => prStr(s, true)).join(' ');
        },
        "str": function () {
            return Array.prototype.map.call(arguments, s => prStr(s, false)).join('');
        },
        "prn": function () {
            console.log(Array.prototype.map.call(arguments, s => prStr(s, true)).join(' '));
            return null;
        },
        "println": function () {
            console.log(Array.prototype.map.call(arguments, s => prStr(s, false)).join(' '));
            return null;
        },
        "read-string": readStr,
        "slurp": function (file) {
            return fs.readFileSync(file, 'utf8');
        },
        "cons": (v, list) => [v].concat(list),
        "concat": function () {
            return Array.prototype.concat.apply([], Array.prototype.slice.call(arguments));
        },
        "first": l => l == null || l.length == 0 ? null : l[0],
        "rest": l => l.slice(1),
        "nth": function (l, n) {
            if (n >= l.length) throw "index out of bounds";
            return l[n];
        },
        "throw": function (val) {
            throw val;
        },
        "apply": function (fn) {
            var args = Array.prototype.slice.call(arguments, 1).reduce((r, c) => r.concat(c), []);
            return (fn instanceof types.MalFunction ? fn.fn : fn).apply(null, args);
        },
        "symbol": function (name) {
            return new types.MalSymbol(name);
        },
        "symbol?": (s) => s && s instanceof types.MalSymbol
    }
};
