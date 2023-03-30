import NodeDefinition from "../model/node_definition.js";

/**
 * @param type {string}
 * @return Promise<NodeDefinition>
 * */
export const GetDefinition = async function (type) {
    const split = type.split(".")
    const nodeName = split[split.length-1];
    const pkg = type.substring(0, type.lastIndexOf("."+nodeName));
    const server = localStorage.getItem("server-addr")

    const response = await fetch(`${server}/node/${nodeName}?pkg=${pkg}`)
    const payload = await response.json();

    if (response.status !== 200 || payload.error) {
        console.error("Server respond", payload);
        throw "server error";
    }

    return new NodeDefinition(payload);
}