const ACTION_UPDATE = "update";
const ACTION_FORCE = "force";

const STATUS_ERROR = "error";
const STATUS_ONLINE = "online";
const STATUS_OFFLINE = "offline";

let url = null;
let ports = [];

const actions = {
    update: async x => {
        url = x.url
        await actions[ACTION_FORCE]();
    },

    force: async () => {
        let result;
        try {
            result = await check();
        } catch (e) {
            result = {status: STATUS_ERROR, url, msg: e}
        }
        send(result);
    }
};

self.onconnect = function (e) {
    const port = e.ports[0];
    console.debug("connected port", port);
    ports.push(port);

    port.addEventListener("message", e => {
        console.debug("port", port, "send message", e.data);
        const request = e.data;

        const handler = actions[request.action];
        if (handler == null) {
            sendError("Unsupported action - "+request.action)
            return
        }

        handler(request);
    })

    port.addEventListener("messageerror", console.error);

    port.start();

    port.postMessage("pong")
}

setInterval(() => {
    check().then(send).catch(sendError);
}, 15_000);

async function check() {
    if (url == null || url === "") {
        throw "url not specified";
    }

    try {
        const resp = await fetch(url + "/health", {mode: "cors"});
        if (resp.status >= 400) {
            return {status: STATUS_ERROR, msg: resp.statusText};
        }
    } catch (e) {
        return {status: STATUS_OFFLINE}
    }

    return {status: STATUS_ONLINE}
}

function send(data) {
    if (data.msg == null) {
        data.msg = ""
    }
    ports.forEach(port => port.postMessage(data));
}

function sendError(msg) {
    send({status: STATUS_ERROR, url, msg});
}

check().then(send).catch(e => send({status: STATUS_ERROR, url, msg: e}));