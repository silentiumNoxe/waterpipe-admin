/**
 * @interface
 * */
export default class FieldRender {

    /**
     * @param definition {NodeDefinitionArgument} - node definition argument
     * @param argument {any} - node argument
     * @param onchange {function(value)}
     * @return HTMLElement
     * */
    draw({definition, argument, onchange}) {
        return null;
    }

    /**
     * @param type {string} - field type
     * @return boolean
     * */
    support(type) {return false}
}