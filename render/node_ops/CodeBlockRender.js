import FieldRender from "./FieldRender.js";

export default class CodeBlockRender extends FieldRender {

    draw({rules, argument, onchange}) {
        const $fs = document.createElement("fieldset")
        $fs.classList.add("input");
        $fs.dataset.type = "code";

        const $legend = document.createElement("legend")
        $legend.textContent = "code";
        const $textarea = document.createElement("textarea");
        $textarea.classList.add("code");
        if (argument != null && argument !== "") {
            $textarea.value = atob(atob(argument)); //todo: bug - encoded twice
        }

        $textarea.addEventListener("keyup", e => {
            const value = e.target.value;

            if (rules.required && value === "") {
                return;
            }

            if (value === "") {
                onchange(value);
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