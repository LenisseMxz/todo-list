import { supabase } from './supabase.js'

const CACHE_KEY = 'tasks_cache';
const PENDING_KEY = 'tasks_pending_sync';

// Guarda las tareas
export async function saveTask(task) {

    if (!navigator.onLine) {
        addToPendingQueue(task.taskTitle);
        return;
    }

    const { data, error } = await supabase
        .from('tasks')
        .insert([{ title: task.taskTitle }]);

    if (error) {
        console.error('Error saving the tasks:', error);
        addToPendingQueue(task.taskTitle);
    } else {
        console.log('Task saved:', data);
    }
}

// Devuelve las tareas
export async function loadTasks() {

    if (!navigator.onLine) {
        return getCachedTasks().concat(
            getPendingQueue().map(title => ({ title }))
        );
    }

    const { data, error } = await supabase
        .from('tasks')
        .select('*');

    if (error) {
        console.error('Error loading the tasks:', error);
        return getCachedTasks().concat(
            getPendingQueue().map(title => ({ title }))
        );
    }

    const tasks = data || [];
    saveCachedTasks(tasks);
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

// Sincroniza las tareas pendientes creadas offline
export async function syncPendingTasks() {

    const pending = getPendingQueue();

    if (pending.length === 0) return;

    const { error } = await supabase
        .from('tasks')
        .insert(pending.map(title => ({ title })));

    if (error) {
        console.error('Error syncing pending tasks:', error);
        return;
    }

    clearPendingQueue();
    console.log('Pending tasks synced:', pending);
}

// Helpers de caché local

function saveCachedTasks(tasks) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(tasks));
}

function getCachedTasks() {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
}

// Helpers de cola pendiente

function getPendingQueue() {
    const pending = localStorage.getItem(PENDING_KEY);
    return pending ? JSON.parse(pending) : [];
}

function addToPendingQueue(title) {
    const pending = getPendingQueue();
    pending.push(title);
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

function clearPendingQueue() {
    localStorage.removeItem(PENDING_KEY);
}