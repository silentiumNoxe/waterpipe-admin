import * as fieldRenders from "./node_ops/define.js";
import {NodeRenderOptions} from "../../model/NodeRenderOptions.js";

/**
 * @param view {NodeView}
 * @param node {ProcessNode}
 * @param def {NodeDefinition}
 * */
export function nodeMenuRender(view, node, def) {
    const $menu = document.getElementById("node-menu");

    const $title = $menu.querySelector("[data-type='node-title']");
    $title.value = node.title || def.name;
    $title.onkeyup = e => {
        view.title = node.title = e.target.value;
    }

    $menu.querySelector("[data-type='node-id']").textContent = node.id;
    $menu.querySelector("[data-type='node-type']").textContent = node.type;
    $menu.open = true;

    const $body = $menu.querySelector(".body");
    $body.innerHTML = "";

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