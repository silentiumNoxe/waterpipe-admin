import NodeDefinitionArgument from "./NodeDefinitionArgument.js";

export default class NodeDefinition {

    name;
    package;
    author;

    /** @type Map<string,NodeDefinitionArgument>*/
    args = new Map();

    render;
    script;
    important;
    constructor(source) {
        this.name = source.name;
        this.package = source.package;
        this.author = source.author;
        this.render = source.render;
        this.script = source.script;
        this.important = source.important;

        for (const name of Object.keys(source.args)) {
            this.args.set(name, new NodeDefinitionArgument(source.args[name]));
        }
    }
}