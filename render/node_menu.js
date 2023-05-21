import * as fieldRenders from "./node_ops/define.js";
import {NodeRenderOptions} from "../model/NodeRenderOptions.js";
import {getDefinition} from "../client/node.js";
import NodeDefinitionArgument from "../model/NodeDefinitionArgument.js";

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
    $menu.dataset.node_id = node.id;

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

    const $nodeId = $menu.querySelector("[data-type='node-id']");
    $nodeId.textContent = node.id;
    $nodeId.onclick = function (e) {
        const id = e.target.textContent;
        navigator.clipboard.writeText(id).catch(console.error);
    }
    $menu.querySelector("[data-type='node-type']").textContent = node.type;
    $menu.open = true;

    const $body = $menu.querySelector(".body");
    $body.innerHTML = "";

    $body.append(commonsGroup(view, node, def));
    $body.append(additionalGroup(view, node, def));
}

/**
 * @param view {NodeView}
 * @param node {ProcessNode}
 * @param def {NodeDefinition}
 * @return HTMLDetailsElement
 * */
function commonsGroup(view, node, def) {
    const $group = group("Logic", true);
    const put = (x) => {
        $group.addField(x);
    }

    if (def.render == null) {
        console.warn(`Definition of node ${node.type} does not has render options`);
        return null;
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
                fieldRenders: fieldRenders.default,
                resultFunc: (value) => {
                    console.debug(`Update node parameter "${name}"`);
                    node.args.set(name, value);
                }
            });
            if ($elem == null) {
                throw "renderer did not return view";
            }
            put($elem);
        } catch (e) {
            console.warn(`render field ${name} failed - ${e}`);
            notifyPopup(notifyPopup.ERROR, `render field ${name} failed - ${e}`);
        }
    });

    return $group;
}

/**
 * @param view {NodeView}
 * @param node {ProcessNode}
 * @param def {NodeDefinition}
 * @return HTMLDetailsElement
 * */
function additionalGroup(view, node, def) {
    const $group = group("Additional");
    const put = (x) => {
        $group.addField(x);
    }

    const $timeout = renderField({
        renderOps: new NodeRenderOptions({view: "number", type: "number"}),
        argument: new NodeDefinitionArgument({type: "number"}),
        value: node.timeout,
        fieldName: "timeout (ms)",
        fieldRenders: fieldRenders.default,
        resultFunc: (value) => {
            console.debug(`Update node parameter "timeout"`);
            if (value < 0) {
                value = 0;
            }
            node.timeout = value;
        }
    })

    put($timeout);

    return $group;
}

/**
 * @return HTMLDetailsElement
 * */
function group(name, open=false) {
    const $group = document.createElement("details");
    $group.classList.add("field-group")
    $group.dataset.type = name.toLowerCase();
    $group.open = open;

    const $name = document.createElement("summary");
    $name.textContent = name;
    $group.append($name);

    const $container = document.createElement("div");
    $container.dataset.list = "field";
    $group.append($container);

    $group.addField = function (child) {
        $container.append(child);
    }

    return $group;
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
        json: value => {
            resultFunc(JSON.parse(value));
        },
        string: value => {
            resultFunc(value);
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