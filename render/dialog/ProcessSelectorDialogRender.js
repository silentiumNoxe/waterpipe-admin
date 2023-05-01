import {AbstractDialogRender} from "./AbstractDialogRender.js";
import * as client from "/client/process.js";

export class ProcessSelectorDialogRender extends AbstractDialogRender {

    static ID = "process-selector";

    draw() {
        const $dialog = document.getElementById(ProcessSelectorDialogRender.ID);
        const $datalist = $dialog.querySelector("[data-list='process']");
        const $inputId = $dialog.querySelector("input[data-type='process-id']");
        const $inputName = $dialog.querySelector("input[data-type='process-name']");

        $inputName.oninput = () => {
            const value = $inputName.value;
            $datalist.childNodes.forEach(ch => {
                ch.hidden = ch.textContent.indexOf(value) === -1;
                if (ch.textContent === value) {
                    $inputId.value = ch.dataset.id;
                }
            })
        }

        const openObserver = new MutationObserver(this.#openDialog)
        openObserver.observe($dialog, {attributes: true})

        return $dialog;
    }

    #openDialog(mutations) {
        for (const mutation of mutations) {
            if (mutation.type === "attributes" && mutation.attributeName === "open") {
                loadData().catch(console.error);
            }
        }
    }
}

async function loadData() {
    const $dialog = document.getElementById(ProcessSelectorDialogRender.ID);
    const $datalist = $dialog.querySelector("[data-list='process']");
    const $inputId = $dialog.querySelector("input[data-type='process-id']");
    const $inputName = $dialog.querySelector("input[data-type='process-name']");

    $datalist.innerHTML = "";

    const processIds = await client.List();
    /** @type Array<Process>*/
    const processList = [];
    for (const id of processIds) {
        processList.push(await client.GetPayload(id, 1));// todo: always version 1
    }

    const optionList = [];
    for (const x of processList) {
        const $process = document.createElement("div")
        $process.addEventListener("click", e => {
            $inputName.value = e.target.textContent;
            $inputId.value = e.target.dataset.id;
        })
        let name = x.name;
        if (x.path != null || x.path !== "") {
            name = x.path + name;
        }
        $process.textContent = name;

        $process.dataset.id = x.id;

        optionList.push($process);
    }

    $datalist.append(...optionList);
}