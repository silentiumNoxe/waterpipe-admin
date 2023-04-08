import NodeView from "../../canvas-view/node.js";
import Render from "./render.js";

/**
 * @param renderOps {Object}
 * @param node {ProcessNode}
 * @return NodeView
 * */
export default function (renderOps, node) {
    const render = Render.of(NodeView);

    render.next(onclick)
        .next(onmouseover)
        .next(onmouseout)
        .next(view => view.id(node.id))
        .next(view => view.setPosition(node.position))
        .next(view => view.important(renderOps.important || false))
        .next(view => title(renderOps, node, x => view.put(x)))
        .next(view => subTitle(renderOps, node, x => view.put(x)))
        .next(view => connectors(renderOps, node, x => view.put(x)))

    return render.build();
}

function onclick(view) {
    view.on("click", e => {
        if (window.connectionStart) {
            e.cancelBubble = true;

            const from = window.NodeLayer.findOne("#" + window.connectionFrom);
            if (from == null) {
                console.warn(`node ${window.connectionFrom} not found`);
                return;
            }

            window.LineLayer.add(from.connectTo(view, window.connectionType));
            disableCurrentConnection();
        }
    });
}

function onmouseover(view) {
    view.on("mouseover", () => {
        if (window.connectionStart) {
            view.shape.fill(Konva.Color.BLUE);
        }
    });
}

function onmouseout(view) {
    view.on("mouseout", () => {
        if (view.important()) {
            view.shape.fill(Konva.Color.WARNING);
        }
        view.shape.fill(Konva.Color.LIGHT);
    });
}

/**
 * @param renderOps {Object}
 * @param node {ProcessNode}
 * @param inject {function(Konva.Node)}
 * */
function title(renderOps, node, inject = () => {
}) {
    if (node.title == null) {
        return;
    }

    const view = new Konva.Text({
        padding: 10,
        width: renderOps.width,
        align: "center",
        fontSize: 18,
        text: node.title,
        fontFamily: Konva.DEFAULT_FONT
    });


    inject(view);
}

/**
 * @param renderOps {Object}
 * @param node {ProcessNode}
 * @param inject {function(Konva.Node)}
 * */
function subTitle(renderOps, node, inject = () => {
}) {
    const view = new Konva.Text({
        y: 30,
        padding: 10,
        width: renderOps.width,
        align: "center",
        fontSize: 12,
        opacity: 0.5,
        text: node.type,
        fontFamily: Konva.DEFAULT_FONT
    });

    inject(view);
}

/**
 * @param renderOps {Object}
 * @param node {ProcessNode}
 * @param inject {function(Konva.Node)}
 * */
function connectors(renderOps, node, inject=()=>{}) {
    if (renderOps.no_connector) {
        return;
    }

    defaultConnector(renderOps, node, inject);
    additionalConnector(renderOps, node, inject);
}

/**
 * @param renderOps {Object}
 * @param node {ProcessNode}
 * @param inject {function(Konva.Node)}
 * */
function defaultConnector(renderOps, node, inject = () => {
}) {
    const conn = renderConnector(node.id, "next_default", {
        x: renderOps.width / 2,
        y: renderOps.height
    });
    inject(conn);
}

/**
 * @param renderOps {Object}
 * @param node {ProcessNode}
 * @param inject {function(Konva.Node)}
 * */
function additionalConnector(renderOps, node, inject = () => {
}) {
    if (renderOps.connectors == null) {
        return;
    }

    for (const id of Object.keys(renderOps.connectors)) {
        const ops = renderOps.connectors[id];
        const conn = renderConnector(node.id, id, {
            x: renderOps.width/100 * ops.position.x,
            y: renderOps.height/100 * ops.position.y
        }, ops.title);
        inject(conn);
    }
}

function renderConnector(nodeId, id, {x, y}, title = {text: "", position: {x: 0, y: 0}, fontSize: 12}) {
    const group = new Konva.Group({id: id, x: x, y: y});
    group.id(id);

    if (title.text !== "") {
        const titleView = new Konva.Text({
            x: title.position.x,
            y: title.position.y,
            fontSize: 12 * title.fontSize,
            text: title.text,
            fontFamily: Konva.DEFAULT_FONT
        });

        group.add(titleView);
    }

    const button = new Konva.Circle({
        radius: 15,
        stroke: Konva.Color.PRIMARY,
        strokeWidth: 2,
        fill: Konva.Color.LIGHT,
    });

    button.on("mouseover", () => {
        document.body.style.cursor = "pointer";
    });
    button.on("mouseend", () => {
        document.body.style.cursor = "auto";
    });

    group.on("click", e => {
        e.cancelBubble = true;

        if (window.disableCurrentConnection) {
            disableCurrentConnection();
        }

        button.fill(Konva.Color.BLUE);
        window.connectionStart = true;
        window.connectionFrom = nodeId;
        window.connectionType = group.id();

        window.disableCurrentConnection = function () {
            button.fill(Konva.Color.LIGHT);
            window.connectionStart = false;
            window.connectionFrom = null;
            window.connectionType = null;
        }
    });

    group.add(button);

    return group;
}