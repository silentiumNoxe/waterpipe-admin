Konva.DEFAULT_FONT = "Ubuntu";
Konva.Color = {
    PRIMARY: "#212525",

    PRIMARY_LIGHT_1: "#202c2c",
    PRIMARY_LIGHT_2: "#2f3f3f",
    PRIMARY_LIGHT_3: "#344848",

    PRIMARY_INVERT: "#a0a8a8",
    PRIMARY_INVERT_2: "#767e7e",

    SUCCESS: "#4d7c45",
    ERROR: "#a24444",
    WARNING: "#bb853e",

    BLUE: "#566c8c",
    BLUE2: "#7290bb"
}

const debugData = {
    width: 400,
    height: 100,
    title: "Test node",
    icon: "code",
    important: true
};

window.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("debug");
    let x = container.querySelector("input#d-width");
    x.value = debugData.width;
    x.addEventListener("change", e => debugData.width = parseInt(e.target.value, 10));

    x = container.querySelector("input#d-height");
    x.value = debugData.height;
    x.addEventListener("change", e => debugData.height = parseInt(e.target.value, 10));

    x = container.querySelector("input#d-title");
    x.value = debugData.title;
    x.addEventListener("change", e => debugData.title = e.target.value);

    x = container.querySelector("input#d-icon");
    x.value = debugData.icon;
    x.addEventListener("change", e => debugData.icon = e.target.value);

    x = container.querySelector("input#d-important");
    x.checked = debugData.important;
    x.addEventListener("change", e => debugData.important = e.target.checked);
})

window.addEventListener("DOMContentLoaded", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const stage = new Konva.Stage({container: "editor", width, height, draggable: false});

    window.mousePosition = function () {
        return stage.getPointerPosition();
    }

    stage.on("wheel", e => {
        const scaleBy = 1.05;
        // stop default scrolling
        e.evt.preventDefault();

        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        // how to scale? Zoom in? Or zoom out?
        let direction = e.evt.deltaY > 0 ? 1 : -1;

        // when we zoom on trackpad, e.evt.ctrlKey is true
        // in that case lets revert direction
        if (e.evt.ctrlKey) {
            direction = -direction;
        }

        const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

        stage.scale({x: newScale, y: newScale});

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };
        stage.position(newPos);
    })

    stage.on("dragmove", () => {
        document.body.style.cursor = "grab";
    })

    stage.on("dragend", () => {
        document.body.style.cursor = "auto";
    })

    const topLayer = window.TopLayer = new Konva.Layer({name: "Top"})
    const midLayer = window.MidLayer = new Konva.Layer({name: "Middle"});
    const bottomLayer = window.BottomLayer = new Konva.Layer({name: "Bottom"});

    /**
     * @param layer {Konva.Layer}
     * @param x {Konva.Node}
     * */
    window.changeLayer = function (layer, x) {
        x.moveTo(layer);
    }

    window.addNode = node => {
        midLayer.add(node);
    };

    bottomLayer.listening(false);

    stage.add(bottomLayer);
    stage.add(midLayer);
    stage.add(topLayer);

    window.dispatchEvent(new CustomEvent("konva/loaded"));
})

window.addEventListener("konva/loaded", async () => {
    const NodeDefinition = (await import("../model/NodeDefinition.js")).default;
    const ProcessNode = (await import("../model/ProcessNode.js")).default;
    const renderShape = (await import("../render/nodeRenderShape.js")).default;
    const renderTitle = (await import("../render/nodeRenderTitle.js")).default;
    const renderImportant = (await import("../render/nodeRenderImportant.js")).default;
    const renderError = (await import("../render/nodeRenderError.js")).default;

    const node = new Konva.Group();
    const shape = new Konva.Rect();
    const title = new Konva.Group();

    node.add(shape, title);

    MidLayer.add(node);

    function frame() {
        const nodeDef = new NodeDefinition({
            name: "test",
            package: "test.test.test",
            author: "",
            important: debugData.important,
            injectable: false,
            inject_type: "",
            script: "",
            args: {
                "string": {type: "string", required: true},
                "foo": {type: "foo"},
                "bar": {type: "bar"},
                "number": {type: "number"}
            },
            render: {
                "icon": debugData.icon
            }
        });

        const nodeData = new ProcessNode({
            id: crypto.randomUUID(),
            title: debugData.title,
            type: "test_node",
            next: null,
            position: {x: 800, y: 100},
            args: {}
        });

        node.x(nodeData.position.x);
        node.y(nodeData.position.y);

        renderShape(shape, {width: debugData.width, height: debugData.height});
        renderTitle(title, {text: debugData.title, icon: nodeDef.render.icon, pkg: nodeDef.package});
        if (nodeDef.important) {
            renderImportant(title, {value: nodeDef.important});
        }
        renderError(title, {value: true, reason: "test error reason"});

        requestAnimationFrame(frame);
    }

    frame();

    // MidLayer.add(new PipeNodeInjectView({
    //     x: 500,
    //     y: 100,
    //     id: crypto.randomUUID(),
    //     type: "string",
    //     title: "one line string"
    // }));
    //
    // MidLayer.add(new PipeNodeInjectView({
    //     x: 600,
    //     y: 200,
    //     id: crypto.randomUUID(),
    //     type: "string",
    //     title: "another one line string"
    // }));
    //
    // MidLayer.add(new PipeNodeInjectView({
    //     x: 500,
    //     y: 150,
    //     id: crypto.randomUUID(),
    //     type: "bar",
    //     title: "bar value"
    // }));
    //
    // MidLayer.add(new PipeNodeInjectView({
    //     x: 500,
    //     y: 200,
    //     id: crypto.randomUUID(),
    //     type: "foo",
    //     title: "foo value"
    // }));
    //
    // MidLayer.add(new PipeNodeInjectView({
    //     x: 500,
    //     y: 250,
    //     id: crypto.randomUUID(),
    //     type: "code",
    //     title: "JS code"
    // }));
})

class PipeNodeView extends Konva.Group {

    static #width = 300;
    static #height = 200;

    constructor({x, y, id, fields}) {
        super({x, y, id, name: "node", listening: true, draggable: true});

        this.on("dragstart", e => changeLayer(TopLayer, e.target));
        this.on("dragend", e => changeLayer(MidLayer, e.target));

        this.add(new Konva.Rect({
            width: PipeNodeView.#width,
            height: PipeNodeView.#height,
            name: "node-shape",
            fill: Konva.Color.PRIMARY_LIGHT_2,
            cornerRadius: 10,
            overflow: "hidden"
        }));

        const fieldsContainer = new Konva.Group({x: 50, y: 50, name: "fields-container"});
        this.add(fieldsContainer);

        for (const i in fields) {
            const f = fields[i];

            const field = new FieldView(i, {x: 0, y: i * 40, name: f.name, type: f.type});
            fieldsContainer.add(field);
        }
    }
}

class FieldView extends Konva.Group {

    constructor(index, {x, y, name, type}) {
        super({x, y, name: `field field-${index} field-type-${type}`});

        const label = this.label = new Konva.Text({
            name: "field-label",
            fill: Konva.Color.PRIMARY_INVERT,
            fontSize: 16,
            text: name,
            fontFamily: Konva.DEFAULT_FONT
        });

        this.add(label);

        const placeholder = this.placeholder = new FieldPlaceholderView(type);
        placeholder.x(label.width() + 10);
        placeholder.y(label.height() / 2 * -1)

        this.add(placeholder);
    }

    injectValue(node) {
        console.debug("inject value", node.id());
        this.placeholder.hide();

        const copy = this.injected = node.getInjectValueView(this);

        copy.addName("injected")
        copy.addName("ref-" + node.id())

        copy.x(this.label.width() + 10);
        copy.y(this.label.height() / 2 * -1)

        this.add(copy);
        node.hide();
    }

    resetInjectValue() {
        console.debug("reset inject value", this.injected.id());

        this.placeholder.show();
        this.injected.remove();
    }

    equals(x) {
        if (!(x instanceof FieldView)) {
            return false;
        }

        return this.id() === x.id() && this.name() === x.name();
    }
}

class FieldPlaceholderView extends Konva.Group {

    constructor(typeName) {
        super({name: "placeholder"});

        this.type = typeName;

        const title = this.title = new Konva.Text({
            x: 10,
            y: 8,
            name: "placeholder-label",
            fill: Konva.Color.PRIMARY_INVERT_2,
            fontSize: 14,
            text: typeName,
            fontStyle: "bold",
            fontFamily: Konva.DEFAULT_FONT
        });

        const shape = this.shape = new Konva.Rect({
            width: title.width() + title.x() * 2,
            height: title.height() + title.y() * 2,
            name: "placeholder-shape",
            fill: Konva.Color.PRIMARY_LIGHT_1,
            cornerRadius: 10
        });

        this.add(shape, title);

        this.width(shape.width());
        this.height(shape.height());
    }

    resetInteraction() {
        this.shape.fill(Konva.Color.PRIMARY_LIGHT_1);
        this.title.fill(Konva.Color.PRIMARY_INVERT_2);
    }

    /**
     * @param x {PipeNodeInjectView}
     * @return boolean - successful interaction
     * */
    interact(x) {
        if (this.type === x.injectType) {
            this.shape.fill(Konva.Color.SUCCESS);
            this.title.fill(Konva.Color.PRIMARY);
            return true;
        }

        this.shape.fill(Konva.Color.ERROR);
        this.title.fill(Konva.Color.PRIMARY);
        return false;
    }
}

class PipeNodeInjectView extends Konva.Group {

    injectType;

    constructor({x, y, id, type, title}) {
        super({x, y, id, name: `inject-node inject-type-${type}`, listening: true, draggable: true});
        this.injectType = type;
        this.title = title;

        const titleView = new Konva.Text({
            x: 10,
            y: 8,
            name: "inject-title",
            fill: Konva.Color.PRIMARY,
            fontSize: 14,
            text: title,
            fontStyle: "bold",
            fontFamily: Konva.DEFAULT_FONT
        });

        this.add(new Konva.Rect({
            width: titleView.width() + titleView.x() * 2,
            height: titleView.height() + titleView.y() * 2,
            name: "inject-shape",
            fill: Konva.Color.PRIMARY_INVERT,
            cornerRadius: 10,
            overflow: "hidden"
        }));

        this.add(titleView);

        this.on("dragstart", e => changeLayer(TopLayer, e.target));
        this.on("dragstart", e => e.target.listTarget = MidLayer.find(".field"))

        this.on("dragend", e => changeLayer(MidLayer, e.target));
        this.on("dragend", e => e.target.listTarget = null);
        this.on("dragend", e => {
            const interacted = e.target.interacted;
            if (interacted == null || !e.target.interactionSuccess) {
                return;
            }

            e.target.fire("injected", {field: interacted});
        })

        this.on("dragmove", e => {
            const target = e.target;
            if (target.listTarget == null || target.listTarget.length === 0) {
                debug("warning", "no list of targets");
                return;
            }

            const rect = target.getClientRect();
            for (const x of target.listTarget) {
                if (this.#haveIntersection(x.getClientRect(), rect)) {
                    this.#interactWith(x);
                    return;
                }
            }

            this.#interactWith(null);
        })

        this.on("injected", e => {
            if (e.field == null) {
                return;
            }

            e.field.injectValue(e.target);
        })
    }

    /** @return Konva.Group */
    getInjectValueView(field) {
        if (field == null) {
            throw new Error("required non null value - field is null");
        }
        const group = new Konva.Group({id: "copy:" + this.id(), name: this.name(), listening: true, draggable: false});
        group.field = field;

        const titleView = new Konva.Text({
            x: 10,
            y: 8,
            name: "inject-title",
            fill: Konva.Color.PRIMARY,
            fontSize: 14,
            text: this.title,
            fontStyle: "bold",
            fontFamily: Konva.DEFAULT_FONT,
            listening: false,
        });

        const shape = new Konva.Rect({
            width: titleView.width() + titleView.x() * 2,
            height: titleView.height() + titleView.y() * 2,
            name: "inject-shape",
            fill: Konva.Color.PRIMARY_INVERT,
            cornerRadius: 10,
            overflow: "hidden",
            listening: true
        })

        group.add(shape, titleView);

        shape.on("dblclick", e => {
            const origin = MidLayer.find("#" + group.id().substring("copy:".length))[0];
            if (origin == null) {
                throw new Error("not found origin: " + group.id());
            }

            const pos = group.absolutePosition();
            origin.position({x: pos.x + 10, y: pos.y + 10});
            origin.moveToTop()

            group.field.resetInjectValue();
            origin.show();
        })

        return group;
    }

    #haveIntersection(a, b) {
        return !(
            b.x > a.x + a.width ||
            b.x + b.width < a.x ||
            b.y > a.y + a.height ||
            b.y + b.height < a.y
        );
    }

    #interactWith(target) {
        if (this.interacted != null && !this.interacted.equals(target)) {
            setTimeout(((x, node) => {
                return () => {
                    if (node.interacted != null && node.interacted.equals(x)) {
                        return;
                    }

                    const p = x.find(".placeholder")[0];
                    if (p == null) {
                        console.warn("no placeholder", node.id);
                        return;
                    }

                    p.resetInteraction();
                }
            })(this.interacted, this), 0);
        }

        this.interacted = target;

        if (target == null) {
            return;
        }

        const placeholder = target.find(".placeholder").at(0);
        this.interactionSuccess = placeholder.interact(this);
    }
}

function drawNode({x, y}, name) {
    // const item = new Konva.Group({x, y, name: "node-group "+name, listening: true, draggable: true});
    // item.on("dragstart", e => changeLayer(TopLayer, e.target));
    // item.on("dragend", e => changeLayer(MidLayer, e.target));
    //
    // item.add(new Konva.Rect({
    //     width: 300,
    //     height: 150,
    //     name: "node-shape",
    //     fill: Konva.Color.PRIMARY_LIGHT_2,
    //     cornerRadius: 10,
    //     overflow: "hidden"
    // }));
    //
    // const arg = new Konva.Group({
    //     x: 50,
    //     y: 50,
    //     name: "arg "+name
    // });
    //
    // item.add(arg);
    //
    // const placeholder = new Konva.Group({
    //     name: "placeholder"
    // })
    //
    // const title = new Konva.Text({
    //     x: 10,
    //     y: 8,
    //     name: "placeholder-label",
    //     fill: Konva.Color.PRIMARY_INVERT,
    //     fontSize: 18,
    //     text: "placeholder",
    //     fontFamily: Konva.DEFAULT_FONT
    // });
    //
    // placeholder.add(new Konva.Rect({
    //     width: title.width() + title.x() * 2,
    //     height: title.height() + title.y() * 2,
    //     name: "placeholder-shape",
    //     fill: Konva.Color.PRIMARY_LIGHT_1,
    //     cornerRadius: 10,
    //     overflow: "hidden"
    // }))
    // // placeholder.add(title);
    // //
    // // arg.add(placeholder);
    //
    // MidLayer.add(item);
    //
    // return item;
}

function drawInjectable({x, y}) {
    const item = new Konva.Group({x, y, name: "inject-group", listening: true, draggable: true});

    item.on("dragstart", e => changeLayer(TopLayer, e.target));
    item.on("dragstart", e => e.target.listTarget = MidLayer.find(".arg"))
    item.on("dragstart", e => {
        if (!e.target.injected) {
            return;
        }

        const p = e.target.interacted;
        e.target.interacted = null;
        e.target.injected = false;

        const x = p.find(".placeholder")[0]
        x.find(".placeholder-shape")[0].fill(Konva.Color.PRIMARY_LIGHT_1);
        x.show();
    })

    item.on("dragend", e => changeLayer(MidLayer, e.target));
    item.on("dragend", e => delete e.target.listTarget);
    item.on("dragend", e => {
        if (e.target.interacted == null) {
            clearDebug();
            return;
        }

        const x = e.target.interacted;
        const p = x.find(".placeholder")[0]
        p.hide();

        debug("interaction", `DEBUG: target node moved to "${x.name()}"`);
        e.target.moveTo(x);
        e.target.injected = true;
    })

    const haveIntersection = function (x1, x2) {
        return !(
            x2.x > x1.x + x1.width ||
            x2.x + x2.width < x1.x ||
            x2.y > x1.y + x1.height ||
            x2.y + x2.height < x1.y
        );
    }

    item.on("dragmove", e => {
        const target = e.target;
        if (target.listTarget == null || target.listTarget.length === 0) {
            debug("warning", "no list of targets");
            return;
        }

        if (target.interacted != null) {
            const placeholder = target.interacted.find(".placeholder")[0];
            const k = placeholder.find(".placeholder-shape")[0];
            k.fill(Konva.Color.PRIMARY_LIGHT_1);
        }

        const rect = target.getClientRect();

        for (const x of target.listTarget) {
            if (!haveIntersection(x.getClientRect(), rect)) {
                continue;
            }

            const placeholder = x.find(".placeholder")[0];
            const k = placeholder.find(".placeholder-shape")[0];
            if (k == null) {
                debug("warning", "WARNING: no placeholder-shape");
                return;
            }

            k.fill(Konva.Color.BLUE);
            target.interacted = x;
        }
    })


    const title = new Konva.Text({
        x: 10,
        y: 8,
        name: "inject-label",
        fill: Konva.Color.PRIMARY,
        fontSize: 18,
        text: "value",
        fontFamily: Konva.DEFAULT_FONT
    })
    const shape = new Konva.Rect({
        width: title.width() + title.x() * 2,
        height: title.height() + title.y() * 2,
        name: "inject-shape",
        fill: Konva.Color.PRIMARY_INVERT,
        cornerRadius: 10,
        overflow: "hidden"
    })

    item.add(shape, title);

    MidLayer.add(item);

    return item;
}

function dragstart() {

}

function debug(label, msg) {
    if (label == null || label === "") {
        label = "default";
    }

    const el = document.getElementById("debug");
    let l = el.querySelector(`[data-label=${label}]`);
    if (l == null) {
        l = document.createElement("p")
        l.dataset.label = label;
        el.append(l)
    }

    l.innerHTML = msg;
}

function clearDebug() {
    const el = document.getElementById("debug");
    if (el != null) {
        el.innerHTML = "";
    }
}