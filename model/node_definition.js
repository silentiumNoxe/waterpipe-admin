export default class NodeDefinition {

    name;
    package;
    author;
    script;
    args;
    render;
    important;
    constructor(source) {
        this.name = source.name;
        this.package = source.package;
        this.author = source.author;
        this.script = source.script;
        this.args = source.args;
        this.render = source.render;
        this.important = source.important;
    }
}