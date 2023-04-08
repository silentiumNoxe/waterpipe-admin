import FieldRender from "./FieldRender.js";

export default class CodeBlockRender extends FieldRender {

    draw({definition, argument, onchange}) {
        const $fs = document.createElement("fieldset")
        $fs.classList.add("input");
        $fs.dataset.type = "code";

        const $legend = document.createElement("legend")
        $legend.textContent = "code";
        const $textarea = document.createElement("textarea");
        $textarea.classList.add("code");
        $textarea.value = atob(argument);

        $textarea.addEventListener("keyup", e => {
            if (definition.required && e.target.value === "") {
                return;
            }

            onchange(btoa(e.target.value));
        });

        $fs.append($legend, $textarea);

        return $fs;
    }

    support(definition) {
        return definition.view === "code";
    }
}