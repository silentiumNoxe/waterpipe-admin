import * as fieldRenders from "./node_ops/define.js";
import {NodeRenderOptions} from "../../model/NodeRenderOptions.js";
import {getDefinition} from "../client/node.js";

/**
 * @param view {NodeView}
 * @param node {ProcessNode}
 * */
export async function nodeMenuRender(view, node) {
    const def = await getDefinition(node.type);
    if (def == null) {
        throw `Definition of node ${node.type} not found`;
    }

    const $menu = document.getElementById("node-menu");

    const $title = $menu.querySelector("[data-type='node-title']");
    $title.value = node.title || def.name;
    $title.onkeyup = e => {
        node.title = e.target.value;
        const titleView = view.findOne("#title");
        if (titleView == null) {
            console.warn("Can't find title of node", view.id());
            return;
        }

        titleView.text(node.title);
    }

    $menu.querySelector("[data-type='node-id']").textContent = node.id;
    $menu.querySelector("[data-type='node-type']").textContent = node.type;
    $menu.open = true;

    const $body = $menu.querySelector(".body");
    $body.innerHTML = "";

    if (def.render == null) {
        console.warn(`Definition of node ${node.type} does not has render options`);
        return;
    }

    if (def.render.args == null) {
        console.warn(`Definition of node ${node.type} does not has render args options`);
        def.render.args = {};
    }

    Object.keys(def.render.args).forEach((name) => {
        try {
            const renderOps = new NodeRenderOptions(def.render.args[name]);
            if (renderOps.view == null) {
                console.debug("Missed node render options for", name);
                return;
            }

            const $elem = renderField({
                renderOps: renderOps,
                argument: def.args.get(name),
                value: node.args.get(name),
                node,
                fieldName: name,
                fieldRenders: fieldRenders.default
            });
            if ($elem == null) {
                throw "renderer did not return view";
            }
            $body.append($elem);
        } catch (e) {
            console.warn(`render field ${name} failed - ${e}`);
        }
    });
}

/**
 * @param renderOps {NodeRenderOptions}
 * @param argument {NodeDefinitionArgument}
 * @param value {any}
 * @param resultFunc {function(value)}
 * @param fieldName {string}
 * @param fieldRenders {Array<FieldRender>}
 * */
function renderField({
                         renderOps,
                         argument,
                         value,
                         fieldName,
                         fieldRenders,
                         resultFunc = () => {
                         }
                     }) {
    const fieldType = argument.type;

    const applyChange = {
        number: value => {
            value = parseFloat(value);
            if (!isNaN(value)) {
                resultFunc(parseFloat(value));
            }
        },
        boolean: value => {
            resultFunc(value === "true");
        },
        code: value => {
            resultFunc(btoa(value));
        },
        any: value => {
            if (value === "") {
                resultFunc(null);
                return
            }

            if (!isNaN(value)) {
                resultFunc(parseFloat(value))
                return;
            }

            if (value.startsWith("{") || value.startsWith("[")) {
                resultFunc(JSON.parse(value));
                return;
            }
        }
    };

    let r = null;
    for (const render of fieldRenders) {
        if (render.support(renderOps)) {
            r = render;
        }
    }

    if (r == null) {
        console.warn(`Render for field "${fieldType}" not found`);
        return;
    }

    return r.draw({
        rules: renderOps,
        title: fieldName,
        argument: value || argument.default,
        onchange: value => {
            const consumer = applyChange[fieldType];
            if (consumer == null) {
                throw `Value consumer for type ${fieldType} not found`;
            }
            consumer(value);
        }
    });
}