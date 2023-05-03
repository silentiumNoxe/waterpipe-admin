import NodeDefinition from "../model/NodeDefinition.js";
import * as util from "./init.js";

/**
 * @param type {string}
 * @return Promise<NodeDefinition>
 * */
export const getDefinition = async function (type) {
    console.debug(`Get node definition - ${type}`);
    const split = type.split(".")
    const nodeName = split[split.length - 1];
    const pkg = type.substring(0, type.lastIndexOf("." + nodeName));

    const response = await util.send(`/node/${nodeName}?pkg=${pkg}`)
    const payload = await response.json();

    if (response.status !== 200 || payload.error) {
        console.error("Server respond", payload);
        throw "server error";
    }

    return new NodeDefinition(payload);
}

/**
 * @param def {NodeDefinition}
 * @return Promise<Object>
 * */
export const save = async function (def) {
    console.debug(`Save node definition - ${def.package}.${def.name}`)
    const response = await util.send("/node", {
        method: "PUT",
        body: JSON.stringify(def)
    });
    const payload = await response.json();

    if (response.status !== 200 || payload.error) {
        console.error("Server respond", payload);
        throw "server error";
    }

    return null;
}

export const list = async function() {
    const response = await util.send("/node");
    const payload = await response.json();
    if (response.status !== 200 || payload.error) {
        console.error("Server respond", payload);
        throw "server error";
    }

    return payload;
}