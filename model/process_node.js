export default class ProcessNode {

    id;
    title;
    type;
    args;
    next;
    timeout;
    position;

    constructor(source) {
        this.id = source.id;
        this.title = source.title;
        this.type = source.type;
        this.args = source.args;
        this.next = source.next;
        this.timeout = source.timeout;
        this.position = source.position;
    }

    isSystem() {
        return this.type.startsWith("waterpipe");
    }
}