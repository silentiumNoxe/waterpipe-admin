export default class ProcessNode {

    /**
     * @param type {string}
     * @return ProcessNode
     * */
    static new(type) {
        return new ProcessNode({id: crypto.randomUUID(), type});
    }

    id;
    title;
    type;

    /** @type Map<string,any>*/
    args = new Map();

    next;
    timeout;
    #position;

    constructor(source) {
        this.id = source.id;
        this.title = source.title;
        this.type = source.type;
        this.next = source.next;
        this.timeout = source.timeout;
        this.#position = source.position;

        if (source.args == null) {
            source.args = {};
        }

        for (const name of Object.keys(source.args)) {
            this.args.set(name, source.args[name]);
        }
    }

    isSystem() {
        return this.type.startsWith("waterpipe");
    }

    get position() {
        return this.#position;
    }

    set position({x, y}) {
        this.#position = {x: Math.round(x), y: Math.round(y)};
    }
}