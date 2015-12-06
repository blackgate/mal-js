function Env(outer, binds, exprs) {
    this.outer = outer;
    this.data = {};
    if (binds === undefined) return;
    for (var i = 0 ; i < binds.length ; i++) {
        if (binds[i] === "&") {
            this.set(binds[i + 1], exprs.slice(i));
            break;
        } else {
            this.set(binds[i], exprs[i]);
        }
    }
}

Env.prototype.set = function (key, val) {
    return this.data[key] = val;
}

Env.prototype.find = function (key) {
    if (key in this.data)
        return this.data[key];
    else if (this.outer)
        return this.outer.find(key);
}

Env.prototype.get = function (key) {
    var val = this.find(key);
    if (val === undefined) throw `'${key}' not found`;
    return val;
}

module.exports = Env;
