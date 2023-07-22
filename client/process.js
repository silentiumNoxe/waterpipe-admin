import Process from "../model/Process.js";
import * as util from "./init.js";

function requireNonNull(value) {
    if (value == null) {
        throw "Require not null value"
    }
    return value
}

function notBlank(value) {
    if (typeof value !== "string") {
        return value;
    }

    if (value.length === 0 || /^\s*$/.test(value)) {
        throw "Require not blank value"
    }

    return value
}

class PipeDTO {
    id;
    name;
    version;
    author;
    path;
    nodes;
    active;
    debug;

    constructor(id, name, version, author = "", path = "", nodes = [], active = true, debug = false) {
        this.id = notBlank(requireNonNull(id));
        this.name = notBlank(requireNonNull(name));
        this.version = requireNonNull(version);
        this.author = author;
        this.path = path;
        this.nodes = nodes;
        this.active = active;
        this.debug = debug;
    }
}

class PipeNodeDTO {
    id;
    title;
    type;
    args;
    next;
    timeout;
    position;

    constructor(id, title, type, args = {}, next, timeout, position) {
        this.id = notBlank(requireNonNull(id));
        this.title = title;
        this.type = notBlank(requireNonNull(type));
        this.args = args;
        this.next = next;
        this.timeout = timeout;
        this.position = requireNonNull(position);
    }
}

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
        throw "invalid process id - " + processId;
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

    return new Process(payload); //todo: return dto
}

/**
 * @param process {Process}
 * @param version {number}
 * @return Promise<Object>
 * */
export const Save = async function (process, version = 1) {
    console.info(`Save process; id=${process.id}; version=${version}; name=${process.name}`)

    const dto = new PipeDTO(
        process.id,
        process.name,
        version,
        process.author,
        process.package,
        [],
        process.active,
        process.debug
    )


    for (const n of process.nodes) {
        dto.nodes.push(new PipeNodeDTO(
            n.id,
            n.title,
            n.type,
            Object.fromEntries(n.args),
            n.next,
            n.timeout,
            n.position
        ))
    }

    const response = await util.send("/process", {method: "POST", body: JSON.stringify(dto)});
    const payload = await response.json();
    if (response.status !== 200 || payload.error) {
        console.error("Server respond", payload);
        throw "server error";
    }
}