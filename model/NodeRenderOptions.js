/**
 * Describe how to render node field
 * */
export class NodeRenderOptions {

    /** @type string*/
    view;
    /** @type string*/
    dataType;
    /** @type boolean*/
    required;

    /**
     * @param source {Object}
     * @param source.view {string} one of - todo: add enum
     * @param source.type {string} data type
     * @param source.required {boolean} does value required
     * */
    constructor(source) {
        this.view = source.view;
        this.dataType = source.type;
        this.required = source.required;
    }
}