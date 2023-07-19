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
    }

    connectedCallback() {

    }

    attributeChangedCallback(name, _, value) {

    }

    #createFile(data) {
        data.get("type")
    }

}, {extends: "dialog"})