import Process from "../model/Process.js";
import * as util from "./init.js";

//todo: to lower case

/**
 * @return Promise<Array<string>>
 * */
export const List = async function () {
    console.info("Get process list")
    const response = await util.send("/process")
    const payload = await response.json();
    if (response.status !== 200 || payload.error) {
        console.error("Server respond", payload);
        throw "server error";
    }

    return payload.list;
}

/**
 * @param processId {string} - uuid
 * @return Promise<Array<string>>
 * */
export const GetVersions = async function (processId) {
    console.info(`Get process version list; id=${processId}`)
    const response = await util.send(`/process/${processId}/version`)
    const payload = await response.json();
    if (response.status !== 200 || payload.error) {
        console.error("Server respond", payload);
        throw "server error";
    }

    return payload.list;
}

/**
 * @param processId {string} - uuid
 * @param version {number}
 * @return Promise<Process>
 * */
export const GetPayload = async function (processId, version) {
    if (processId == null || processId === "") {
        throw "invalid process id - "+processId;
    }

    if (version < 1) {
        throw "invalid process version. Must be great then zero";
    }

    console.info(`Get process payload; id=${processId}; version=${version}`)

    const server = localStorage.getItem("server-addr")
    if (server == null || server === "") {
        throw "Server address not specified"
    }

    const response = await fetch(`${server}/process/${processId}?v=${version}`)
    const payload = await response.json();
    if (response.status !== 200 || payload.error) {
        console.error("Server respond", payload);
        throw "server error";
    }

    return new Process(payload);
}

/**
 * @param process {Process}
 * @param version {number}
 * @return Promise<Object>
 * */
export const Save = async function(process, version=1) {
    console.info(`Save process; id=${process.id}; version=${version}`)

    const dto = {
        id: process.id,
        name: process.name,
        version: version,
        author: process.author,
        path: process.path,
        nodes: [],
        active: process.active,
        debug: process.debug
    };

    for (const n of process.nodes) {
        dto.nodes.push({
            id: n.id,
            title: n.title,
            type: n.type,
            args: Object.fromEntries(n.args),
            next: n.next,
            timeout: n.timeout,
            position: n.position
        });
    }

    const response = await util.send("/process", {method: "POST", body: JSON.stringify(dto)});
    const payload = await response.json();
    if (response.status !== 200 || payload.error) {
        console.error("Server respond", payload);
        throw "server error";
    }
}