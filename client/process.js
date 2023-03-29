import Process from "../process.js";

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