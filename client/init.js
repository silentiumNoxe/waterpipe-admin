/** @return Promise<Response>*/
export const send = function (path, ops={}) {
    if (!path.startsWith("/")) {
        path = "/"+path;
    }

    const server = localStorage.getItem("server-addr")
    if (server == null || server === "") {
        return Promise.reject("server addr is missed");
    }

    ops.mode = "cors";

    return fetch(server+path, ops);
}