import { supabase } from './supabase.js'

const CACHE_KEY = 'tasks_cache';

// Guarda la tarea
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

// Devuelve las tareas de Supabase si hay conexión, de localStorage si no
export async function loadTasks() {

    if (!navigator.onLine) {
        return getCachedTasks();
    }

    const { data, error } = await supabase
        .from('tasks')
        .select('*');

    if (error) {
        console.error('Error loading the tasks:', error);
        return getCachedTasks(); // fallback por si falla aunque "cree" estar online
    }

    const tasks = data || [];
    saveCachedTasks(tasks); // actualiza la copia local
    return tasks;
}

// Borra la tarea
export async function eraseTask(task) {
    const { data, error } = await supabase
        .from('tasks')
        .delete()
        .eq('title', task.taskTitle)

    if (error) {
        console.error('Error deleting task:', error);
    }
}

// Helpers de caché local

function saveCachedTasks(tasks) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(tasks));
    } catch (e) {
        console.error('Error saving cache:', e);
    }
}

function getCachedTasks() {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        return cached ? JSON.parse(cached) : [];
    } catch (e) {
        console.error('Error reading cache:', e);
        return [];
    }
}