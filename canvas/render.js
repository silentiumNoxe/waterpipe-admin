/**
 * @template T
 * */
export default class Render {

    /** @type {T}*/
    #view;

    /**
     * @param x {T}
     * */
    static of(x) {
        if (x == null) {
            throw "Can't build render from null";
        }

        return new Render(new x());
    }

    /** @param view {T}*/
    constructor(view) {
        this.#view = view;
    }

    /**
     * @param fn {function(T)}
     * @return
     * */
    next(fn) {
        fn(this.#view);
        return this;
    }

    /**
     * @return T
     * */
    build() {
        return this.#view;
    }
}