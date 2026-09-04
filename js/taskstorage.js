// Guarda las tareas a la nube local
export function saveTasks(tasks) {

    const taskTitles = tasks.map(t => t.taskTitle);

    localStorage.setItem("tasks", JSON.stringify(taskTitles));
}

// Devuelve las tareas de la nube local
export function loadTasks() {

    const data = localStorage.getItem("tasks");

    return data ? JSON.parse(data) : [];
}