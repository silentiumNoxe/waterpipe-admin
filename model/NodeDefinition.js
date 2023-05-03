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

    /**
     * @param source {Object}
     * @param source.name {string} - node name
     * @param source.package {string|null} - namespace
     * @param source.author {string}
     * @param source.render {Object|null}
     * @param source.args {Object|null}
     * @param source.script {string|null}
     * @param source.important {boolean} - sync task after completing this node
     * */
    constructor(source) {
        if (source.name == null || source.name === "" ) {
            throw "missed name";
        }
        this.name = source.name;
        this.package = source.package || "";
        this.author = source.author;
        this.render = source.render || {};
        this.script = source.script || "";
        this.important = source.important;

        for (const name of Object.keys(source.args || {})) {
            this.args.set(name, new NodeDefinitionArgument(source.args[name]));
        }
    }
}