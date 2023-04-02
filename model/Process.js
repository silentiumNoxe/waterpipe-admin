import ProcessNode from "./ProcessNode.js";

export default class Process {

    id;
    name;
    version;
    author;
    path;
    /** @type Array<ProcessNode>*/
    nodes = [];
    active;
    debug;
    createdAt;

    constructor(source) {
        if (source == null) {
            throw "empty process data";
        }

        this.id = source.id;
        this.name = source.name;
        this.author = source.author;
        this.active = source.active;
        this.debug = source.debug;
        this.createdAt = source.created_at;
        this.path = source.path;
        this.version = source.version;

        for (const x of source.nodes) {
            this.nodes.push(new ProcessNode(x))
        }
    }
}