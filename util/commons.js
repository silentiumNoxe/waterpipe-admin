const TIME_SECOND = 1000;

function isNumber(value) {
    if (typeof value !== "string") {
        return false;
    }
    return !isNaN(value) && !isNaN(parseFloat(value))
}

function updateServer(url) {
    if (url == null || url === "") {
        throw "invalid url";
    }

    localStorage.setItem("server-addr", url); //todo: use indexeddb
}

function selectServer() {
    document.getElementById("select-addr-dialog").open = true;
}

function applyServer() {
    const $input = document.getElementById("server-addr-input");
    const url = $input.value;
    if (url == null || url === "") {
        $input.classList.add("error")
        return
    }

    localStorage.setItem("server-addr", url);
    document.getElementById("select-addr-dialog").open = false;
}

function notifyPopup(level, message) {
    const $notify = document.getElementById("notify");
    if ($notify == null) {
        console.error("#notify element not found");
        return
    }

    const $message = document.createElement("article");
    $message.innerHTML = message;
    $message.classList.add(level);

    if (level === notifyPopup.ERROR) {
        $message.innerHTML += "<br>Please report about it <a href='mailto:silentium.noxe@gmail.com'>silentium.noxe@gmail.com</a>"
    }

    $notify.append($message);

    const timeoutId = setTimeout(() => $message.remove(), TIME_SECOND * 30);
    $message.addEventListener("click", () => {
        $message.remove();
        clearTimeout(timeoutId);
    });
}

notifyPopup.SUCCESS = "success";
notifyPopup.WARNING = "warning";
notifyPopup.ERROR = "error";