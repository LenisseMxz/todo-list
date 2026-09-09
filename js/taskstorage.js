import { supabase } from './supabase.js'

// Guarda la tarea a la base de datos
export async function saveTask(task) {
    const { data, error } = await supabase
        .from('tasks')
        .insert([{ title: task.taskTitle }]);

    if (error) {
        console.error('Error saving the tasks:', error);
    } else {
        console.log('Task saved:', data);
    }
}

// Devuelve las tareas de la base de datos
export async function loadTasks() {
    const { data, error } = await supabase
        .from('tasks')
        .select('*');

    if (error) {
        console.error('Error loading the tasks:', error);
        return [];
    }

    return data || []
}

// Borra la tarea en la base de datos
export async function eraseTask(task) {
    const { data, error } = await supabase
        .from('tasks')
        .delete()
        .eq('title', task.taskTitle)

    if (error) {
        console.error('Error deleting task:', error);
    }
}