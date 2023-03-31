import Process from "../model/process.js";
import * as util from "./init.js";

/**
 * @return Array<string>
 * */
export const List = async function () {
}

/**
 * @param processId {string} - uuid
 * @return Array<string>
 * */
export const GetVersions = async function (processId) {

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
export const Save = async function(process, version=0) {
    const clone = new Process(process);
    clone.version = version;
    const response = await util.send("/process", {method: "POST", body: JSON.stringify(clone)});
    const payload = await response.json();
    if (response.status !== 200 || payload.error) {
        console.error("Server respond", payload);
        throw "server error";
    }
}