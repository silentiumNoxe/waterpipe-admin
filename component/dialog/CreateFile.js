const style = `
    <style>
      
    </style>
`;

const template = `
<header>
  <button data-action="close">
    <span class="material-symbols-outlined bold">close</span>
  </button>
</header>
<div>
  <div class="hide" data-type="warning"></div>
  <form autocomplete="off">
    <label>
      <span class="bold">File type:</span>
      <input class="bold" name="type" type="text" list="file-type">
      <datalist id="file-type">
        <option value="folder"/>
        <option value="pipe"/>
        <option value="node"/>
      </datalist>
    </label>
    <label>
      <span class="bold">Name:</span>
      <input name="name" type="text">
    </label>
    <input type="submit" value="Create" formmethod="dialog">
  </form>
</div>
`;

const warningFolderType = `
<p><span class="material-symbols-outlined filled warning icon">warning</span>Folder without content will not be saved</p>
`

customElements.define("waterpipe-create-file", class extends HTMLDialogElement {

    static get observedAttributes() {
        return []
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
            const $form = event.target.parentElement;
            const data = new FormData($form);

            setTimeout(() => this.#createFile(data))
        })

        this.querySelector("input[name='type']").addEventListener("change", event => {
            const value = event.target.value;
            if (value === "folder") {
                this.#writeWarning(warningFolderType)
            }
        })
    }

    connectedCallback() {

    }

    attributeChangedCallback(name, _, value) {

    }

    #createFile(data) {
        data.get("type")
    }

    #writeWarning(template) {
        const $x = this.querySelector("[data-type='warning']")
        $x.innerHTML = template
        $x.classList.remove("hide")
    }

}, {extends: "dialog"})