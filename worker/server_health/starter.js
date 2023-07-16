import {ACTION_UPDATE, ACTION_FORCE, STATUS_ERROR} from "/worker/server_health/constant.js";

let worker = null;

export function start(urlSupplier, receiver=console.debug) {
    try {
        run(urlSupplier, receiver);
    } catch (e) {
        receiver(STATUS_ERROR, urlSupplier(), new Error("Unable to start healthcheck - "+e));
    }
}

export function updateURL(url) {
    worker.port.postMessage({action: ACTION_UPDATE, url});
    worker.port.postMessage({action: ACTION_FORCE});
}

export function forceCheck() {
    worker.port.postMessage({action: ACTION_FORCE});
}

function run(urlSupplier, receiver) {
    worker = new SharedWorker("/worker/server_health/worker.js", {
        type: "module",
        name: "server_healthcheck"
    });

    worker.port.start();

    function onerror(e) {
        if (receiver == null) {
            console.error(e);
        }

        receiver(STATUS_ERROR, urlSupplier(), e)
    }

    worker.addEventListener("error", onerror)
    worker.port.addEventListener("error", onerror)
    worker.port.addEventListener("messageerror", onerror)

    worker.port.addEventListener("message", e => {
        if (e.data === "pong") {
            console.debug("Started server healthcheck");
            return;
        }

        if (receiver != null) {
            const resp = e.data
            receiver(resp.status, resp.url, resp.msg)
        }
    })

    worker.port.postMessage({action: ACTION_UPDATE, url: urlSupplier()})
    worker.port.postMessage({action: ACTION_FORCE})
}