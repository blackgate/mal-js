var types = require('./types');

module.exports = function prStr(obj, print_readably) {
    var r = "";
    if (obj instanceof Array) {
        return "(" + obj.map(o => prStr(o, print_readably)).join(" ") + ")";
    } else if (obj instanceof types.MalSymbol) {
        return obj.name;
    } else if (obj === null) {
        return "nil";
    } else if (obj instanceof types.MalFunction ||
        !!(obj.constructor && obj.call && obj.apply)) {
        return "#<function>";
    } else if (print_readably) {
        return JSON.stringify(obj);
    } else {
        return obj.toString();
    }
}
