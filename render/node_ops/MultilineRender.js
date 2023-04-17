import FieldRender from "./FieldRender.js";

export default class MultilineRender extends FieldRender {

    #dataMapper = {};


    constructor() {
        super();
        //todo: define extended render for json & code content
        this.#dataMapper.json = {stringify: this.#jsonContent};
        this.#dataMapper.code = {stringify: this.#codeContent};
        this.#dataMapper.default = {stringify: this.#simpleContent};
    }

    draw({rules, title, argument, onchange}) {
        const $fs = document.createElement("fieldset")
        $fs.classList.add("input");
        $fs.dataset.type = "multiline";

        const $legend = document.createElement("legend")
        $legend.textContent = rules.required ? title + "*" : title;
        const $textarea = document.createElement("textarea");
        //todo: used another class which describe same behaviour
        $textarea.classList.add("code");

        const mapper = this.#dataMapper[rules.dataType]
        if (mapper == null) {
            throw "Unsupported data type - "+rules.dataType;
        }

        $textarea.value = mapper.stringify(argument);

        let cancel;
        $textarea.addEventListener("keyup", e => {
            if (cancel != null) {
                cancel();
            }
            const id = setTimeout(() => {
                let value = e.target.value;

                if (rules.required && value === "") {
                    return;
                }

                if (value === "") {
                    onchange(value);
                    return;
                }

                onchange(value);
            }, 5000);
            cancel = () => clearTimeout(id);
        });

        $fs.append($legend, $textarea);

        return $fs;
    }

    #codeContent(value) {
        if (value == null || value === "") {
            return ""
        }

        return atob(value);
    }

    #jsonContent(value) {
        if (value == null || value === "") {
            return ""
        }

        return JSON.stringify(value, null, "\t");
    }

    #simpleContent(value) {
        if (value == null || value === "") {
            return ""
        }

        return value+"";
    }

    support(ops) {
        return ops.view === "multiline";
    }
}