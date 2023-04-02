import NodeDefinitionArgument from "./NodeDefinitionArgument.js";

export default class NodeDefinition {

    name;
    package;
    author;
    args = [];
    render;
    important;
    constructor(source) {
        this.name = source.name;
        this.package = source.package;
        this.author = source.author;
        this.render = source.render;
        this.important = source.important;

        for (const name of Object.keys(source.args)) {
            this.args.push(new NodeDefinitionArgument(source.args[name]));
        }
    }
}