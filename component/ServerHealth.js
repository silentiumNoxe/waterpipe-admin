import * as constant from "../worker/server_health/constant.js";
import * as healthcheck from "../worker/server_health/starter.js";

const style = `
    <style>
      * {
        outline: none;
      }
      
      :host {
        --offline-color: orange;
        --online-color: green;
        --error-color: red;
        
        --border-radius: 26px;
        --border-width: 1px;
        
        --padding: 4px 12px;
        
        width: fit-content;
        display: block;
        
        text-align: center;
        vertical-align: center;
      }
      
      div[data-status] {
        padding: var(--padding);
        border-radius: var(--border-radius);
        border: var(--border-width) solid black;
        transition: 800ms;
        
        display: flex;
      }
      
      div[data-status="offline"] {
        border-color: var(--offline-color);
        color: var(--offline-color);
      }
      
      div[data-status="online"] {
        border-color: var(--online-color);
        color: var(--online-color);
      }
      
      div[data-status="error"] {
        border-color: var(--error-color);
        color: var(--error-color);
      }
      
      span[data-type="text"] {
        padding: 4px 0;
      }
      
      button[data-action="sync"] {
        background: transparent;
        border: none;
        cursor: pointer;
      }
      
      button[data-action="sync"] img {
        width: 20px;
      }
      
      .anim {
        animation: 1s linear infinite forwards running foo;
      }
      
      @keyframes foo {
        from {
        transform: rotate(0deg);
        }
        
        to {
        transform: rotate(-360deg);
        }
      }
    </style>
`;

const template = `
    <div data-status="offline">
        <span data-type="text"></span>
    </div>
`;

const message = {
    "online": "Online",
    "offline": "You are offline",
    "error": "Unable to check"
}

customElements.define("waterpipe-server-health", class extends HTMLElement {

    static get observedAttributes() {
        return ["target"]
    }

    constructor() {
        super();

        this.root = this.attachShadow({mode: "closed"});
        this.root.innerHTML = `
            ${style}
            ${template}
        `;

        this.#changeStatus(constant.STATUS_OFFLINE);
    }

    connectedCallback() {
        healthcheck.start(
            () => this.getAttribute("target"),
            (val, _, msg) => {
                this.#changeStatus(val, msg)
            }
        )
    }

    attributeChangedCallback(name, _, value) {
        if (name === "target") {
            if (value == null) {
                console.warn("passed empty target server url")
            }
            setTimeout(() => healthcheck.updateURL(value), 1000)
        }
    }

    #changeStatus(status, reason="") {
        const $elem = this.root.querySelector("[data-status]")
        $elem.dataset.status = status;
        $elem.querySelector("span").innerText = message[status];

        this.root.querySelector("[data-status]").title = reason;
    }
})