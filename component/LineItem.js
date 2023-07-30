const style = `
    <style>
      @import "../style/commons.css";
      
      :host {
        --border-radius: 25px;
        
        width: 100%;
        padding: 5px;
      }
      
      :host(:host:focus) {
        outline: var(--color-blue) solid 2px;
        border-radius: var(--border-radius);
      }
      
      .line {
        outline: none;
        user-select: none;
        
        display: flex;
        
        border: 1px solid var(--color-dark-1);
        border-radius: var(--border-radius);
        
        background-color: var(--color-dark-1);
        
        padding: 5px;
      }
      
      .line > span {
        display: block;
      }
      
      .line > * {
        padding-left: 10px;
        padding-top: 6px;
      }
      
      button {
        border: none;
        background: transparent;
        cursor: pointer;
      }
      
      [data-type="icon"] {
        width: 3%;
      }
      
      [data-type="name"] {
        width: 50%;
      }
      
      [data-type="author"] {
        width: 10%;
      }
      
      [data-type="timestamp"] {
        width: 20%;
      }
      
      button[data-type="menu"] {
        margin-left: auto;
        margin-right: 1vw;
        float: right;
        color: var(--color-primary-invert);
      }
      button[data-type="menu"] span {
        width: 10%;
      }
      button[data-type="menu"]:focus {
        background-color: transparent;
      }
    </style>
`;

const template = `
<div class="line">
  <span class="material-symbols-outlined filled" data-type="icon"></span>
  <span class="bold" data-type="name"></span>
  <span data-type="author">N/A</span>
  <span data-type="timestamp">N/A</span>
  
  <button data-type="menu">
      <span class="material-symbols-outlined cursor float-right">more_vert</span>
  </button>
</div>
`;

customElements.define("waterpipe-line-item", class extends HTMLElement {

    #type;
    #name;
    #author;
    #timestamp;
    #href;

    static get observedAttributes() {
        return ["type", "name", "author", "timestamp", "href"]
    }

    constructor() {
        super();

        this.root = this.attachShadow({mode: "closed"});
        this.root.innerHTML = `
            ${style}
            ${template}
        `;
    }

    connectedCallback() {
        this.addEventListener("dblclick", () => {
            if (this.#href == null || this.#href === "") {
                return
            }

            window.open(this.#href)
        })
    }

    attributeChangedCallback(name, _, value) {
        this[name] = value
    }

    set type(val) {
        this.#type = val

        const icon = {
            folder: "folder",
            "folder-pipe": "polyline",
            pipe: "deployed_code",
            node: "category"
        }

        this.root.querySelector("[data-type='icon']").textContent = icon[val];
    }

    set name(val) {
        if (val == null || val === "") {
            val = "N/A"
        }

        this.#name = val;
        this.root.querySelector("[data-type='name']").textContent = val;
    }

    set author(val) {
        if (val == null || val === "") {
            val = "N/A"
        }

        this.#author = val;
        this.root.querySelector("[data-type='author']").textContent = val;
    }

    set timestamp(val) {
        if (val == null || val === "") {
            val = "N/A"
        }

        if (val !== "N/A" && (typeof val === "string" || typeof val === "number")) {
            val = new Date(val)
        }

        this.#timestamp = val;
        this.root.querySelector("[data-type='timestamp']").textContent = val.toLocaleString();
    }

    set href(val) {
        this.#href = val;
    }
})