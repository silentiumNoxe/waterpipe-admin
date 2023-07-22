import ProcessNode from "./ProcessNode.js";

export default class Process {

    static empty(path, name, author) {
        const final = new ProcessNode({
            id: crypto.randomUUID(),
            type: "waterpipe.final",
            position: {x: 0, y: 200}
        })
        const start = new ProcessNode({
            id: crypto.randomUUID(),
            type: "waterpipe.start",
            next: final.id,
            position: {x: 0, y: 0},
        })

        return new Process({
            id: crypto.randomUUID(),
            name,
            author,
            path,
            active: true,
            debug: false,
            version: 1,
            created_at: new Date(),
            nodes: [start, final]
        })
    }

    id;
    name;
    version;
    author;
    package;
    /** @type Array<ProcessNode>*/
    nodes = [];
    active;
    debug;
    createdAt;

    /**
     * @param source {Object}
     * @param source.id {string}
     * @param source.name {string}
     * @param source.author {string}
     * @param source.active {boolean}
     * @param source.debug {boolean}
     * @param source.created_at {string}
     * @param source.path {string}
     * @param source.version {number}
     * */
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
        this.package = source.path;
        this.version = source.version;

        for (const x of source.nodes) {
            this.nodes.push(new ProcessNode(x))
        }
    }
}