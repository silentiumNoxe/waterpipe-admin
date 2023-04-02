export default class NodeDefinitionArgument {

    /** @type string*/
    type;

    /** @type any*/
    default;

    /** @type boolean*/
    required;

    constructor(source) {
        this.type = source.type;
        this.default = source.default;
        this.required = source.required;
    }
}