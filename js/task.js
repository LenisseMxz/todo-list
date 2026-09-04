class Task {

    #title;

    constructor(title) {
        this.#title = title;
    }

    // Devuelve el título de la tarea
    get taskTitle() {
        return this.#title;
    }
}

export { Task };