export class NodeRenderOptions {

    view;
    required;

    constructor(source) {
        this.view = source.view;
        this.required = source.required;
    }
}