module.exports = {
    MalSymbol: function MalSymbol(name) {
        this.name = name;
    },
    MalFunction: function MalFunction(ast, params, env, fn) {
        this.ast = ast;
        this.params = params;
        this.env = env;
        this.fn = fn.bind(this);
        this.isMacro = false;
    }
}
