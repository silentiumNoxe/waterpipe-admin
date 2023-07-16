const model = {
    folder: {

    },
    process: {
        idRegex: new RegExp("(?<id>.+)\\/(?<version>.+)"),
        dblclick: id => id
    },
    node: {
        idRegex: new RegExp("((?<pkg>.*)\\.)?(?<name>\\w+)"),
        buildUrl: function (id) {
            let matches = this.idRegex.exec(id);
            return matches.groups["name"]+"?pkg="+matches.groups["pkg"]
        }
    }
}

const style = ``;

const template = ``;

customElements.define("waterpipe-list-item", class extends HTMLElement {

    #itemId;
    #model;

    static get observedAttributes() {
        return ["model", "item-id"]
    }

    constructor() {
        super();

        this.root = this.attachShadow({mode: "closed"});
        this.root.innerHTML = `
            ${style}
            ${template}
        `;

        this.addEventListener("dblclick", () => {
            window.open(`/${this.#model}/${model[this.#model].buildUrl(this.#itemId)}`);
        })
    }

    connectedCallback() {
    }

    attributeChangedCallback(name, _, value) {
        if (name === "model") {
            if (model[value] == null) {
                throw "unsupported model - "+value
            }
            this.#model = value;
        }

        if (name === "item-id") {
            const regex = model[this.#model].idRegex
            if (!regex.test(value)) {
                throw "invalid item id"
            }
            this.#itemId = value;
        }
    }
})