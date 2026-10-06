import { supabase } from './supabase.js'

const CACHE_KEY = 'tasks_cache';
const PENDING_KEY = 'tasks_pending_sync';
const PENDING_DELETE_KEY = 'tasks_pending_delete';

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
        addToCache(task.taskTitle);
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

    if (!navigator.onLine) {
        const wasPending = removeFromPendingQueue(task.taskTitle);

        if (!wasPending) {
            addToPendingDeleteQueue(task.taskTitle);
        }

        removeFromCache(task.taskTitle);
        return;
    }

    const { data, error } = await supabase
        .from('tasks')
        .delete()
        .eq('title', task.taskTitle)

    if (error) {
        console.error('Error deleting task:', error);
    } else {
        removeFromCache(task.taskTitle);
    }
}

// Sincroniza inserciones y eliminaciones pendientes creadas offline
export async function syncPendingTasks() {

    const pendingInserts = getPendingQueue();
    const pendingDeletes = getPendingDeleteQueue();

    if (pendingInserts.length > 0) {
        const { error } = await supabase
            .from('tasks')
            .insert(pendingInserts.map(title => ({ title })));

        if (error) {
            console.error('Error syncing pending inserts:', error);
        } else {
            clearPendingQueue();
            console.log('Pending inserts synced:', pendingInserts);
        }
    }

    if (pendingDeletes.length > 0) {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .in('title', pendingDeletes);

        if (error) {
            console.error('Error syncing pending deletes:', error);
        } else {
            clearPendingDeleteQueue();
            console.log('Pending deletes synced:', pendingDeletes);
        }
    }
}

// Helpers de caché local
function saveCachedTasks(tasks) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(tasks));
}

function getCachedTasks() {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
}

function removeFromCache(title) {
    const cached = getCachedTasks();
    const filtered = cached.filter(t => t.title !== title);
    saveCachedTasks(filtered);
}

function addToCache(title) {
    const cached = getCachedTasks();
    const alreadyThere = cached.some(t => t.title === title);
    if (!alreadyThere) {
        cached.push({ title });
        saveCachedTasks(cached);
    }
}

// Helpers de cola de inserciones pendientes
function getPendingQueue() {
    const pending = localStorage.getItem(PENDING_KEY);
    return pending ? JSON.parse(pending) : [];
}

function addToPendingQueue(title) {
    const pending = getPendingQueue();
    pending.push(title);
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

// Borra la tarea de la cola de tareas pendientes (por añadir)
function removeFromPendingQueue(title) {
    const pending = getPendingQueue();
    const filtered = pending.filter(t => t !== title);

    const wasPending = filtered.length !== pending.length;
    localStorage.setItem(PENDING_KEY, JSON.stringify(filtered));
    return wasPending;
}

function clearPendingQueue() {
    localStorage.removeItem(PENDING_KEY);
}

// Helpers de cola de eliminaciones pendientes
function getPendingDeleteQueue() {
    const pending = localStorage.getItem(PENDING_DELETE_KEY);
    return pending ? JSON.parse(pending) : [];
}

function addToPendingDeleteQueue(title) {
    const pending = getPendingDeleteQueue();
    pending.push(title);
    localStorage.setItem(PENDING_DELETE_KEY, JSON.stringify(pending));
}

function clearPendingDeleteQueue() {
    localStorage.removeItem(PENDING_DELETE_KEY);
}