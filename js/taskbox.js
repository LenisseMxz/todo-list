class Taskbox {

    #tasks = [];

    // Devuelve una copia de las tareas
    get tasks() {
        return [...this.#tasks];
    }

    //  Inserta una copia de las tareas
    set tasks(tasks) {
        this.#tasks = [...tasks];
    }

    // Agrega una tarea
    addTask(task) {
        this.#tasks.push(task);
    }

    // Elimina la tarea específica
    deleteTask(task) {

        const index = this.#tasks.findIndex(t => t.taskTitle === task.taskTitle);

        if (index !== -1) {
            this.#tasks.splice(index, 1);
            return true;
        }
        return false;
    }
}

export { Taskbox };