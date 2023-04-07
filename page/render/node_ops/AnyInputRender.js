import FieldRender from "./FieldRender.js";

export default class AnyInputRender extends FieldRender {

    draw({definition, title, argument, onchange}) {
        const $fs = document.createElement("fieldset");
        $fs.classList.add("input");
        const $legend = document.createElement("legend");
        $legend.textContent = definition.required ? title + "*" : title;
        const $input = document.createElement("input");
        $input.value = argument || definition.default || "";
        $input.addEventListener("keyup", e => {
            let value = e.target.value;
            if (value === "") {
                onchange(null);
                return
            }

            if (!isNaN(value)) {
                onchange(parseFloat(value))
                return;
            }

            if (value.startsWith("{") || value.startsWith("[")) {
                onchange(JSON.parse(value));
                return;
            }

            onchange(value);
        });

        $fs.append($legend);
        $fs.append($input);
        return $fs;
    }

    support(definition) {
        return definition.view === "any";
    }
}