import { Taskbox } from "./taskbox.js";
import { Task } from "./task.js";
import { saveTask, loadTasks, eraseTask } from "./taskstorage.js";

// Asigna clase principal
let myTaskbox = new Taskbox();

// Declara constantes de elementos HTML
const btnAdd = document.getElementById("btn-add");
const tasksContainer = document.getElementById("tasks");

// Offline
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/todo-list/sw.js")
    .then(() => console.log("Service Worker registrado"))
    .catch(err => console.error("Error al registrar SW:", err));
}

// Al cargar la página
document.addEventListener("DOMContentLoaded", async () => {

    const tasks = await loadTasks();

    myTaskbox.tasks = tasks.map(task => new Task(task.title))

    tasks.innerHTML = "";

    myTaskbox.tasks.forEach(task => {

        const div = document.createElement("div");
        const taskLabel = document.createElement("label");
        const btnDelete = document.createElement("button");

        taskLabel.textContent = task.taskTitle;
        btnDelete.textContent = "x";

        btnDelete.addEventListener("click", async () => {
            await eraseTask(task);
            myTaskbox.deleteTask(task.taskTitle);
            div.remove();
        });

        div.appendChild(taskLabel);
        div.appendChild(btnDelete);

        tasksContainer.appendChild(div);
    });
});

// Bóton de añadir tarea
btnAdd.addEventListener("click", async () => {
    
    const inputTask = document.getElementById("input-task");
    const task = inputTask.value;

    const newTask = new Task(task)

    myTaskbox.addTask(newTask);

    // Base de datos
    await saveTask(newTask);

    const div = document.createElement("div");
    const taskLabel = document.createElement("label");
    const btnDelete = document.createElement("button");
    
    taskLabel.textContent = task;
    btnDelete.textContent = "x";

    btnDelete.addEventListener("click", async () => {
        await eraseTask(newTask);
        myTaskbox.deleteTask(newTask);
        div.remove();
    });     

    div.appendChild(taskLabel);
    div.appendChild(btnDelete);

    tasksContainer.appendChild(div);

    inputTask.value = "";
})