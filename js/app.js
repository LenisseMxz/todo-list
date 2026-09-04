import { Taskbox } from "./taskbox.js";
import { Task } from "./task.js";
import { saveTasks, loadTasks } from "./taskstorage.js";

// Asigna clase principal
let myTaskbox = new Taskbox();

// Declara constantes de elementos HTML
const btnAdd = document.getElementById("btn-add");
const tasks = document.getElementById("tasks");

// Offline
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(() => console.log("Service Worker registrado"))
    .catch(err => console.error("Error al registrar SW:", err));
}

// Al cargar la página
document.addEventListener("DOMContentLoaded", () => {

    myTaskbox.tasks = loadTasks().map(taskTitle => new Task(taskTitle));

    tasks.innerHTML = "";

    myTaskbox.tasks.forEach(task => {

        const div = document.createElement("div");
        const taskLabel = document.createElement("label");
        const btnDelete = document.createElement("button");

        taskLabel.textContent = task.taskTitle;
        btnDelete.textContent = "x";

        btnDelete.addEventListener("click", () => {
            myTaskbox.deleteTask(task.taskTitle);
            div.remove();

            // Nube local
            saveTasks(myTaskbox.tasks);
        });

        div.appendChild(taskLabel);
        div.appendChild(btnDelete);

        tasks.appendChild(div);
    });
});

// Bóton de añadir tarea
btnAdd.addEventListener("click", () => {
    
    const inputTask = document.getElementById("input-task");
    const task = inputTask.value;

    const newTask = new Task(task)

    myTaskbox.addTask(newTask);

    // Nube local
    saveTasks(myTaskbox.tasks);

    const div = document.createElement("div");
    const taskLabel = document.createElement("label");
    const btnDelete = document.createElement("button");
    
    taskLabel.textContent = task;
    btnDelete.textContent = "x";

    btnDelete.addEventListener("click", () => {
        myTaskbox.deleteTask(task);
        div.remove();
    });     

    div.appendChild(taskLabel);
    div.appendChild(btnDelete);

    tasks.appendChild(div);

    inputTask.value = "";
})