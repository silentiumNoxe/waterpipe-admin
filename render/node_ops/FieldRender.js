/**
 * @abstract
 * todo: this class should be decorator for class render. Here should be standardized render.
 * */
export default class FieldRender {

    /**
     * @param rules {NodeRenderOptions} - node definition argument
     * @param title {string} - field title
     * @param argument {any} - node argument
     * @param onchange {function(value)}
     * @return HTMLElement
     * */
    draw({rules, title, argument, onchange}) {
        return null;
    }

    /**
     * @param ops {NodeRenderOptions} - field type
     * @return boolean
     * */
    support(ops) {return false}
}