import { Taskbox } from "./taskbox.js";
import { Task } from "./task.js";
import { saveTask, loadTasks, eraseTask, syncPendingTasks } from "./taskstorage.js";
import { supabase } from "./supabase.js";

// Registro del Service Worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
        .then(() => console.log("Service Worker registrado"))
        .catch(err => console.error("Error al registrar SW:", err));
}

let myTaskbox = new Taskbox();
let currentUser = null;

const tasksContainer = document.getElementById("tasks");
const authView = document.getElementById("auth-view");
const appView = document.getElementById("app-view");

// Convierte un username a un correo derivado único
function usernameToEmail(username) {
    return `${username.trim().toLowerCase()}@todoapp.local`;
}

// Cambio de vistas
function showView(view) {
    authView.hidden = view !== "auth";
    appView.hidden = view !== "app";
}

// Render de tareas
function renderTasks() {
    tasksContainer.innerHTML = "";
    myTaskbox.tasks.forEach(task => {
        const div = document.createElement("div");
        const taskLabel = document.createElement("label");
        const btnDelete = document.createElement("button");

        taskLabel.textContent = task.taskTitle;
        btnDelete.textContent = "x";

        btnDelete.addEventListener("click", async () => {
            myTaskbox.deleteTask(task);
            await eraseTask(task, currentUser.id);
            div.remove();
        });

        div.appendChild(taskLabel);
        div.appendChild(btnDelete);
        tasksContainer.appendChild(div);
    });
}

// Login
document.getElementById("btn-login").addEventListener("click", async () => {
    const username = document.getElementById("auth-username").value;
    const password = document.getElementById("auth-password").value;
    const email = usernameToEmail(username);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Usuario o contraseña incorrectos");
});

// Registro
document.getElementById("btn-signup").addEventListener("click", async () => {
    try {
        const username = document.getElementById("auth-username").value;
        const password = document.getElementById("auth-password").value;
        const email = usernameToEmail(username);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { username } }
        });

        if (error) {
            if (error.message.includes("already") || error.message.includes("existe")) {
                alert("Ese nombre de usuario ya existe");
            } else {
                alert("Error al crear cuenta: " + error.message);
            }
            return;
        }

        if (data.session) {
            showView("app");
            loadTasksForUser();
        }
    } catch (e) {
        alert("Excepción: " + e.message)
    }
});

// Escuchar cambios de sesión
supabase.auth.onAuthStateChange(async (event, session) => {

    console.log("AUTH EVENT:", event, session?.user?.email);

    currentUser = session?.user ?? null;

    if (currentUser) {
        showView("app");
        await syncPendingTasks(currentUser.id);
        loadTasksForUser();
    } else {
        showView("auth");
        myTaskbox.tasks = [];
        renderTasks();

        if (currentUser) {
            localStorage.removeItem(`${CACHE_KEY}_${currentUser.id}`);
            localStorage.removeItem(`${PENDING_KEY}_${currentUser.id}`);
            localStorage.removeItem(`${PENDING_DELETE_KEY}_${currentUser.id}`);
        }
    }
});

// Cargar tareas del usuario logueado
async function loadTasksForUser() {
    const tasks = await loadTasks(currentUser.id);
    myTaskbox.tasks = tasks.map(task => new Task(task.title));
    renderTasks();
}

// Botón de añadir tarea
document.getElementById("btn-add").addEventListener("click", async () => {
    
    if (!currentUser) return;

    const inputTask = document.getElementById("input-task");
    const task = new Task(inputTask.value);

    myTaskbox.addTask(task);
    await saveTask(task, currentUser.id);
    renderTasks();
    inputTask.value = "";
});

document.getElementById("btn-logout").addEventListener("click", async () => {
    await supabase.auth.signOut();
});

// Al volver la conexión
window.addEventListener("online", async () => {
    if (!currentUser) return;
    await syncPendingTasks(currentUser.id);
    await loadTasksForUser();
});