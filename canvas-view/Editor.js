export default class Editor {

    /** @type Konva.Stage*/
    #stage;
    /** @type EventTarget*/
    #eventTarget;

    static build({width, height, draggable, scalable}) {
        const editor = new Editor();
        editor.#eventTarget = new EventTarget();

        const stage = editor.#stage = new Konva.Stage({container: "editor", width, height, draggable});

        if (scalable) {
            stage.on("wheel", editor.#scaleFunc());
        }

        if (draggable) {
            stage.on("dragmove", () => document.body.style.cursor = "grab");
            stage.on("dragend", () => document.body.style.cursor = "auto");
        }

        stage.on("click", () => {
            const mouse = editor.mousePos();
            editor.#eventTarget.dispatchEvent(new CustomEvent("click", {detail: {x: mouse.x, y: mouse.y}}))
        });
        stage.on("dblclick", () => {
            const mouse = editor.mousePos();
            editor.#eventTarget.dispatchEvent(new CustomEvent("dblclick", {detail: {x: mouse.x, y: mouse.y}}))
        });

        return editor;
    }

    /**
     * @param target {string}
     * @param func {function(CustomEvent)}
     * */
    listen(target, func) {
        this.#eventTarget.addEventListener(target, func);
    }

    /**
     * @param layer {Konva.Layer}
     * */
    addLayer(layer) {
        this.#stage.add(layer);
    }

    #scaleFunc() {
        const stage = this.#stage;

        return (event) => {
            const scaleBy = 1.05;

            event.evt?.preventDefault();

            const deltaY = e.evt?.deltaY || 0;

            const oldScale = stage.scaleX();
            const pointer = this.mousePos();

            const mousePointTo = {
                x: (pointer.x - stage.x()) / oldScale,
                y: (pointer.y - stage.y()) / oldScale,
            }

            const direction = deltaY > 0 ? 1 : -1;

            const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

            stage.scale({x: newScale, y: newScale});

            const newPos = {
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale,
            };
            stage.position(newPos);
        }
    }

    /**
     * @return {{x: number, y: number}}
     * */
    mousePos() {
        return this.#stage.getPointerPosition();
    }
}