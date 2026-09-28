import { supabase } from './supabase.js'

// Guarda la tarea a la base de datos
export async function saveTask(task) {
    // Online
    if (navigator.onLine) {
        const { data, error } = await supabase
        .from('tasks')
        .insert([{ title: task.taskTitle }]);

        if (error) {
            console.error('Error saving the tasks:', error);
        } else {
            console.log('Task saved:', data);
        }
    // Offline
    } else {
        let offlineTasks = JSON.parse(localStorage.getItem("offlineTasks")) || [];
        offlineTasks.push(newTask);
        localStorage.setItem("offlineTasks", JSON.stringify(offlineTasks));
        console.log("Guardado offline:", newTask.taskTitle);
    }
}

// Devuelve las tareas de la base de datos
export async function loadTasks() {
  if (navigator.onLine) {
    try {
      // Online
      const { data, error } = await supabase
        .from("tasks")
        .select("*");

      if (error) {
        console.error("Error cargando tareas de Supabase:", error);
        return JSON.parse(localStorage.getItem("offlineTasks")) || [];
      }

      return data || [];

    } catch (err) {
      console.error("Error inesperado:", err);
      return JSON.parse(localStorage.getItem("offlineTasks")) || [];
    }
  } else {
    return JSON.parse(localStorage.getItem("offlineTasks")) || [];
  }
}

// Borra la tarea en la base de datos
export async function eraseTask(task) {
    // Online
    if (navigator.onLine) {
        const { data, error } = await supabase
        .from('tasks')
        .delete()
        .eq('title', task.taskTitle)

        if (error) {
            console.error('Error deleting task:', error);
        }
    // Offline
    } else {
        let offlineTasks = JSON.parse(localStorage.getItem("offlineTasks")) || [];
        offlineTasks = offlineTasks.filter(t => t.taskTitle !== newTask.taskTitle);
        localStorage.setItem("offlineTasks", JSON.stringify(offlineTasks));
    }
}