export default class ProcessNode {

    id;
    title;
    type;
    args;
    next;
    timeout;

    constructor(source) {
        this.id = source.id;
        this.title = source.title;
        this.type = source.type;
        this.args = source.args;
        this.next = source.next;
        this.timeout = source.timeout;
    }

    isSystem() {
        return this.type.startsWith("waterpipe");
    }
}