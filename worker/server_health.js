let url = null;
let ports = [];

self.onconnect = function (e) {
    const port = e.ports[0];
    console.debug("connected port", port);
    ports.push(port);

    port.addEventListener("message", e => {
        console.debug("port", port, "send message", e.data);
        const request = e.data;

        switch (request.action) {
            case "update":
                console.info("change server url to", request.url);
                url = request.url;
                break;
            case "force":
                console.info("force server health");
                check().then(send).catch(e => send({status: "error", url, msg: e}));
                break;
        }
    })

    port.addEventListener("messageerror", console.error);

    port.start();
}

setInterval(() => {
    check().then(send).catch(e => send({status: "error", url, msg: e}));
}, 15_000);

async function check() {
    if (url == null || url === "") {
        return {status: "offline", msg: "url not specified"};
    }

    console.debug("check", url);
    const resp = await fetch(url + "/health", {mode: "cors"});
    if (resp.status >= 200 && resp.status < 300) {
        return {status: "online"};
    }

    return {status: "error", msg: resp.statusText};
}

function send(data) {
    console.debug("send check result");
    ports.forEach(port => port.postMessage(data));
}

check().then(send).catch(e => send({status: "error", url, msg: e}));