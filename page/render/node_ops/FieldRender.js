/**
 * @interface
 * */
export default class FieldRender {

    /**
     * @param definition {NodeDefinitionArgument} - node definition argument
     * @param title {string} - field title
     * @param argument {any} - node argument
     * @param onchange {function(value)}
     * @return HTMLElement
     * */
    draw({definition, title, argument, onchange}) {
        return null;
    }

    /**
     * @param definition {NodeDefinitionArgument} - field type
     * @return boolean
     * */
    support(definition) {return false}
}