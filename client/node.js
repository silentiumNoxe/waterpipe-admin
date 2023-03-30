import NodeDefinition from "../model/node_definition.js";

/**
 * @param type {NodeDefinition}
 * */
export const GetDefinition = function (type) {
    switch (type) {
        case "waterpipe.start":
            return start
    }
}

const start = new NodeDefinition({
    name: "start",
    package: "waterpipe",
    author: "system",
    script: null,
    args: {},
    render: {} //todo: think about it
});