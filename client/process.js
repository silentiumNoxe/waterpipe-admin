import Process from "../model/Process.js";
import * as util from "./init.js";

/**
 * @return Promise<Array<string>>
 * */
export const List = async function () {
    return [
        "17819942-ec88-4337-a31d-2305679abba8",
        "bc552b07-c186-4d1e-8ec3-b034dcabc94b",
        "f83379f5-fe32-4875-b130-89cd210a911f",
        "227590f4-704e-48d9-9c58-630e502cb6c7",
        "fae2a241-eb4d-4b1c-9d73-c577d6d335c4",
        "eb6d9366-e9b5-4585-8e1f-9efd36a8e6d7",
        "c9ee557d-a682-43e1-b616-135c62dbb890",
        "aca07a56-10ed-45f3-9fe1-4793980e5a0e",
        "17819942-ec88-4337-a31d-2305679abba8",
        "bc552b07-c186-4d1e-8ec3-b034dcabc94b",
        "f83379f5-fe32-4875-b130-89cd210a911f",
        "227590f4-704e-48d9-9c58-630e502cb6c7",
        "fae2a241-eb4d-4b1c-9d73-c577d6d335c4",
        "eb6d9366-e9b5-4585-8e1f-9efd36a8e6d7",
        "c9ee557d-a682-43e1-b616-135c62dbb890",
        "aca07a56-10ed-45f3-9fe1-4793980e5a0e",
    ];
}

/**
 * @param processId {string} - uuid
 * @return Promise<Array<string>>
 * */
export const GetVersions = async function (processId) {
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

    const server = localStorage.getItem("server-addr")
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