import PipeNodeView from "../view/PipeNodeView.js";
import PipeNodeInjectView from "../view/PipeNodeInjectView.js";

/**
 * @param def {NodeDefinition}
 * @param node {ProcessNode}
 * @return Konva.Group
 * */
export default async function (def, node) {
    console.debug("render", node.type);

    if (def.injectable) {
        return renderInjectable(def, node);
    }

    return renderNode(def, node);
}

/**
 * @param def {NodeDefinition}
 * @param node {ProcessNode}
 * @return Konva.Group
 * */
async function renderNode(def, node) {
    return new PipeNodeView(def, node);
}

/**
 * @param def {NodeDefinition}
 * @param node {ProcessNode}
 * @return Konva.Group
 * */
async function renderInjectable(def, node) {
    return new PipeNodeInjectView(def, node);
}