import NodeView from "../canvas-view/node.js";
import renderNode from "./renderNode.js";

/**
 * @param renderOps {Object}
 * @param node {ProcessNode}
 * @return NodeView
 * */
export default function(renderOps, node) {
    const view = new NodeView();

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

    const view = new Konva.Circle({
        radius: 15,
        stroke: Konva.Color.PRIMARY,
        strokeWidth: 2,
        fill: Konva.Color.LIGHT,
    });

    group.add(title, view);

    view.on("mouseover", () => {
        document.body.style.cursor = "pointer";
    });
    view.on("mouseend", () => {
        document.body.style.cursor = "auto";
    })

    inject(group);
}