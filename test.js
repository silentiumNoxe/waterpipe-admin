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
    drawMain()
    drawInjectable()
})

function drawMain() {
    const item = new Konva.Group({x: 100, y: 100, listening: true, draggable: true});
    item.add(new Konva.Rect({
        width: 300,
        height: 150,
        fill: Konva.Color.PRIMARY_LIGHT_2,
        cornerRadius: 10,
        overflow: "hidden"
    }));

    const placeholder = new Konva.Group({x: 50, y: 50, listening: true, draggable: false})

    const title = new Konva.Text({
        x: 10,
        y: 8,
        fill: Konva.Color.PRIMARY_INVERT,
        fontSize: 18,
        text: "placeholder",
        fontFamily: Konva.DEFAULT_FONT
    });

    placeholder.add(new Konva.Rect({
        width: title.width()+title.x()*2,
        height: title.height()+title.y()*2,
        fill: Konva.Color.PRIMARY_LIGHT_1,
        cornerRadius: 10,
        overflow: "hidden"
    }))
    placeholder.add(title);

    item.add(placeholder);

    MidLayer.add(item);
}

function drawInjectable() {
    const item = new Konva.Group({x: 500, y: 100, listening: true, draggable: true});
    const title = new Konva.Text({
        x: 10,
        y: 8,
        fill: Konva.Color.PRIMARY,
        fontSize: 18,
        text: "value",
        fontFamily: Konva.DEFAULT_FONT
    })
    const shape = new Konva.Rect({
        width: title.width()+title.x()*2,
        height: title.height()+title.y()*2,
        fill: Konva.Color.PRIMARY_INVERT,
        cornerRadius: 10,
        overflow: "hidden"
    })

    item.add(shape, title);

    MidLayer.add(item);
}

function dragstart() {

}