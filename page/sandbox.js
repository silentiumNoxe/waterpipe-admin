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

    stage.on("dblclick", () => {
        const mouse = mousePosition();
        startDialog("create-node", `[data-type="node-type"]`)
            .then(response => {
                if (response.type == null) {
                    throw "Type not specified";
                }
                createNode(response.type, mouse);
            })
            .catch(e => {
                if (e !== "canceled") {
                    console.error(e);
                }
            })
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

window.addEventListener("konva/loaded", () => {
    let node = new PipeNodeView({x: 100, y: 100, id: crypto.randomUUID(), fields: [{name: "test", type: "string"}]})
    MidLayer.add(node);

    // const a = drawNode({x: 100, y: 100}, "testA")
    // drawNode({x: 100, y: 300}, "testB")
    // drawNode({x: 100, y: 500}, "testC")
    // const n = drawInjectable({x: 0, y: 0})

    // const x = a.find(".arg")[0];
    // n.moveTo(x);
})

class PipeNodeView extends Konva.Group {

    static #width = 300;
    static #height = 150;

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
            const field = new FieldView(i, {name: f.name, type: f.type});
            fieldsContainer.add(field);
        }
    }
}

class FieldView extends Konva.Group {

    constructor(index, {name, type}) {
        super({name: `field field-${index} field-type-${type}`});

        const label = new Konva.Text({
            name: "field-label",
            fill: Konva.Color.PRIMARY_INVERT,
            fontSize: 16,
            text: name,
            fontFamily: Konva.DEFAULT_FONT
        });

        this.add(label);

        const placeholder = new FieldPlaceholderView(type);
        placeholder.x(label.width()+10);
        placeholder.y(label.height()/2 * -1)

        this.add(placeholder);
    }
}

class FieldPlaceholderView extends Konva.Group {

    constructor(typeName) {
        super();

        const title = new Konva.Text({
            x: 10,
            y: 8,
            name: "placeholder-label",
            fill: Konva.Color.PRIMARY_LIGHT_3,
            fontSize: 14,
            text: typeName,
            fontStyle: "bold",
            fontFamily: Konva.DEFAULT_FONT
        });

        const shape = new Konva.Rect({
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