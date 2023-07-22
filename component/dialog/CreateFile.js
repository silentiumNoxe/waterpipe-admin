const template = `
<header>
  <button data-action="close">
    <span class="material-symbols-outlined bold">close</span>
  </button>
</header>
<div>
  <div class="hide" data-type="warning"></div>
  <form autocomplete="off">
    <label title="The path from current directory. Dot is a delimiter">
      <span class="bold">Path:</span>
      <input name="path" type="text">
    </label>
    <label>
      <span class="bold">Name:</span>
      <input name="name" type="text">
    </label>
    <input type="submit" value="Create" formmethod="dialog">
  </form>
</div>
`

customElements.define("waterpipe-create-file", class extends HTMLDialogElement {

    #path = "root"
    #data = {}

    static get observedAttributes() {
        return ["path"]
    }

    constructor() {
        super();

        this.innerHTML = `
            ${template}
        `;

        this.querySelector("button[data-action='close']").addEventListener("click", () => {
            this.close("canceled");
        })

        this.querySelector("input[type='submit']").addEventListener("click", event => {
            const $form = event.target.parentElement
            this.#data = Object.fromEntries(new FormData($form).entries())
            this.#data.path = this.#path + this.#data.path
        })

        this.addEventListener("close", () => {
            this.returnValue = JSON.stringify(this.#data)
            this.remove()
        })
    }

    connectedCallback() {
    }

    attributeChangedCallback(name, _, value) {
        if (name === "path") {
            this.path = value+"."
        }
    }

    #createFile(data) {
        data.get("type")
    }

    set path(value) {
        this.#path = value
    }

}, {extends: "dialog"})