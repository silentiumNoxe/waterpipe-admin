/**
 * Describe argument definition. Data type and requiring.
 * */
export default class NodeDefinitionArgument {

    /** @type string*/
    type;

    /** @type any*/
    default;

    /** @type boolean*/
    required;

    /** @type string*/
    connector;

    /**
     * @param source {Object}
     * @param source.type {string} one of - number, string, boolean, json, code, any, node
     * @param source.default {any} default value
     * @param source.required {boolean} does this value required
     * @param source.connector {string} qualifier of connector view. View link to another node and this link will pass here
     * */
    constructor(source) {
        this.type = source.type;
        this.default = source.default;
        this.required = source.required;
        this.connector = source.connector;
    }
}