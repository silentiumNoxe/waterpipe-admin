import NodeView from "../../canvas-view/node.js";
import Render from "../render.js";
import {nodeMenuRender} from "../node_menu.js";
import {getDefinition} from "../../client/node.js";

/**
 * @param renderOps {Object}
 * @param node {ProcessNode}
 * @return NodeView
 * */
export default function (renderOps, node) {
    const render = Render.of(NodeView);

    if (renderOps == null) {
        renderOps = {};
    }
    //todo: remove hardcore
    renderOps.width = 300;
    renderOps.height = 150;

    render.next(ondblclick)
        .next(onclick)
        .next(onmouseover)
        .next(onmouseout)
        .next(view => showNodeMenu(view, node))
        .next(view => ondragmove(view, node))
        .next(view => view.id(node.id))
        .next(view => view.setPosition(node.position))
        .next(view => view.important(renderOps.important || false))
        .next(view => title(renderOps, node.title || node.type.substring(node.type.lastIndexOf(".") + 1), x => view.put(x)))
        .next(view => subTitle(renderOps, node, x => view.put(x)))
        .next(view => connectors(renderOps, node, x => view.put(x)))

    return render.build();
}

function ondblclick(view) {
    view.on("dblclick", e => {
        e.cancelBubble = true;
    })
}

function onclick(view) {
    view.on("click", e => {
        if (window.connectionStart) {
            e.cancelBubble = true;

            if (window.connectionFrom == null) {
                console.warn("Something went wrong - connection from is empty");
                return;
            }

            if (window.connectionType == null) {
                console.warn("Something went wrong - connection type is empty");
                return;
            }

            const from = window.NodeLayer.findOne("#" + window.connectionFrom);
            if (from == null) {
                console.warn(`node ${window.connectionFrom} not found`);
                return;
            }

            window.LineLayer.add(from.connectTo(view, window.connectionType));

            //Save new connection
            /** @type Process*/
            const process = window.CurrentProcess;
            const nFrom = process.nodes.filter(x => x.id === window.connectionFrom)[0];
            if (window.connectionType !== "next_default") {
                getDefinition(nFrom.type)
                    .then(def => def.args)
                    .then(args => args.forEach((value, key) => {
                        if (value.type === "node" && value.connector === window.connectionType) {
                            nFrom.args[key] = view.id();
                        }
                    }));
            }
            nFrom.next = view.id();

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

function ondragmove(view, node) {
    view.on("dragmove", () => node.position = view.getPosition());
}

function showNodeMenu(view, node) {
    view.on("click", e => {
        e.cancelBubble = true;
        nodeMenuRender(view, node).catch(console.error);
    })
}

/**
 * @param renderOps {Object}
 * @param text {string}
 * @param inject {function(Konva.Node)}
 * */
function title(renderOps, text, inject = () => {
}) {
    const view = new Konva.Text({
        id: "title",
        padding: 10,
        width: renderOps.width,
        align: "center",
        fontSize: 18,
        text,
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
        id: "sub-title",
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
function connectors(renderOps, node, inject = () => {
}) {
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
            x: renderOps.width / 100 * ops.position.x,
            y: renderOps.height / 100 * ops.position.y
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