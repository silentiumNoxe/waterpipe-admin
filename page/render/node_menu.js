import * as fieldRenders from "./node_ops/define.js";

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

    def.args.forEach((definition, name) => {
        const $elem = renderField({definition, node, fieldName: name, fieldRenders: fieldRenders.default});
        if ($elem == null) {
            return;
        }
        $body.append($elem);
    });
}

/**
 * @param definition {NodeDefinitionArgument}
 * @param node {ProcessNode}
 * @param fieldName {string}
 * @param fieldRenders {Array<FieldRender>}
 * */
function renderField({definition, node, fieldName, fieldRenders}) {
    const fieldType = definition.type;
    const nodeArg = node.args.get(fieldName);

    const applyChange = {
        number: value => {
            value = parseFloat(value);
            if (!isNaN(value)) {
                node.args.set(fieldName, parseFloat(value));
            }
        },
        boolean: value => {
            node.args.set(fieldName, value === "true");
        },
        code: value => {
            node.args.set(fieldName, btoa(value));
        }
    };

    let r = null;
    for (const render of fieldRenders) {
        if (render.support(definition)) {
            r = render;
        }
    }

    if (r == null) {
        console.warn(`Render for field "${fieldType}" not found`);
        return;
    }

    return r.draw({
        definition,
        title: fieldName,
        argument: nodeArg || definition.default,
        onchange: value => {
            const consumer = applyChange[fieldType];
            if (consumer == null) {
                throw `Value consumer for type ${fieldType} not found`;
            }
            consumer(value);
        }
    });
}