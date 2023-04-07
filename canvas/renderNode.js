import NodeView from "../canvas-view/node.js";
import renderNode from "./renderNode.js";

/**
 * @param renderOps {Object}
 * @param node {ProcessNode}
 * @return NodeView
 * */
export default function(renderOps, node) {
    const view = new NodeView();

    view.on("click", () => {
        if (window.connectionStart) {
            const from = window.NodeLayer.findOne("#"+window.connectionFrom);
            if (from == null) {
                console.warn(`node ${window.connectionFrom} not found`);
                return;
            }

            window.LineLayer.add(from.connectTo(view, window.connectionType));
            disableCurrentConnection();
        }
    });

    view.on("mouseover", () => {
        if (window.connectionStart) {
            view.shape.fill(Konva.Color.BLUE);
        }
    });

    view.on("mouseout", () => {
        if (view.important()) {
            view.shape.fill(Konva.Color.WARNING);
        }
        view.shape.fill(Konva.Color.LIGHT);
    });

    view.id(node.id);
    view.setPosition(node.position);
    view.important(renderOps.important || false);

    title(renderOps, node, view.put.bind(view));
    subTitle(renderOps, node, view.put.bind(view));
    nextNode(renderOps, node, view.put.bind(view));

    return view;
}

/**
 * @param renderOps {Object}
 * @param node {ProcessNode}
 * @param inject {function(Konva.Node)}
 * */
function title(renderOps, node, inject=()=>{}) {
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
function subTitle(renderOps, node, inject=()=>{}) {
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
function nextNode(renderOps, node, inject=()=>{}) {
    const group = new Konva.Group({
        id: "next_default",
        x: renderOps.width / 2,
        y: renderOps.height,
    });

    const title = new Konva.Text({
        x: -20,
        y: -30,
        fontSize: 12,
        text: "default",
        fontFamily: Konva.DEFAULT_FONT
    });

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
        window.connectionFrom = node.id;
        window.connectionType = group.id();

        window.disableCurrentConnection = function () {
            button.fill(Konva.Color.LIGHT);
            window.connectionStart = false;
            window.connectionFrom = null;
            window.connectionType = null;
        }
    });

    group.add(title, button);

    inject(group);
}