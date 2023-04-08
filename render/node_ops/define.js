import CodeBlockRender from "./CodeBlockRender.js";
import StringInputRender from "./StringInputRender.js";
import NumberInputRender from "./NumberInputRender.js";
import BoolInputRender from "./BoolInputRender.js";
import AnyInputRender from "./AnyInputRender.js";
import InputRender from "./InputRender.js";

export default [
    new CodeBlockRender(),
    new StringInputRender(),
    new NumberInputRender(),
    new BoolInputRender(),
    new AnyInputRender(),
    new InputRender(),
];