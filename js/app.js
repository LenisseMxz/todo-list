import { Taskbox } from "./taskbox.js";
import { Task } from "./task.js";
import { saveTask, loadTasks, eraseTask, syncPendingTasks } from "./taskstorage.js";

// Registro del Service Worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/todo-list/sw.js")
        .then(() => console.log("Service Worker registrado"))
        .catch(err => console.error("Error al registrar SW:", err));
}

let myTaskbox = new Taskbox();

const btnAdd = document.getElementById("btn-add");
const tasksContainer = document.getElementById("tasks");

// Renderiza todas las tareas de myTaskbox en el DOM
function renderTasks() {

    tasksContainer.innerHTML = "";

    myTaskbox.tasks.forEach(task => {

        const div = document.createElement("div");
        const taskLabel = document.createElement("label");
        const btnDelete = document.createElement("button");

        taskLabel.textContent = task.taskTitle;
        btnDelete.textContent = "x";

        btnDelete.addEventListener("click", async () => {
            myTaskbox.deleteTask(task.taskTitle);
            await eraseTask(task);
            div.remove();
        });

        div.appendChild(taskLabel);
        div.appendChild(btnDelete);

        tasksContainer.appendChild(div);
    });
}

// Al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
    const tasks = await loadTasks();
    myTaskbox.tasks = tasks.map(task => new Task(task.title));
    renderTasks();
});

// Botón de añadir tarea
btnAdd.addEventListener("click", async () => {

    const inputTask = document.getElementById("input-task");
    const task = inputTask.value;

    const newTask = new Task(task);

    myTaskbox.addTask(newTask);

    await saveTask(newTask);

    renderTasks();

    inputTask.value = "";
});

// Al volver la conexión
window.addEventListener("online", async () => {
    await syncPendingTasks();
    const tasks = await loadTasks();
    myTaskbox.tasks = tasks.map(task => new Task(task.title));
    renderTasks();
});