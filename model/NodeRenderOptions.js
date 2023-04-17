export class NodeRenderOptions {

    /** @type string*/
    view;
    /** @type string*/
    dataType;
    /** @type boolean*/
    required;

    constructor(source) {
        this.view = source.view;
        this.dataType = source.type;
        this.required = source.required;
    }
}