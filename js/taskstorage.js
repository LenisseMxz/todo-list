import { supabase } from './supabase.js'

const CACHE_KEY = 'tasks_cache';
const PENDING_KEY = 'tasks_pending_sync';
const PENDING_DELETE_KEY = 'tasks_pending_delete';

// Guarda las tareas
export async function saveTask(task, userId) {
    if (!navigator.onLine) {
        addToPendingQueue(task.taskTitle, userId);
        return;
    }

    const { data, error } = await supabase
        .from('tasks')
        .insert([{ title: task.taskTitle, user_id: userId }]);

    if (error) {
        console.error('Error saving the tasks:', error);
        addToPendingQueue(task.taskTitle, userId);
    } else {
        console.log('Task saved:', data);
        addToCache(task.taskTitle, userId);
    }
}

// Devuelve las tareas del usuario
export async function loadTasks(userId) {
    if (!navigator.onLine) {
        return getCachedTasks(userId).concat(
            getPendingQueue(userId).map(title => ({ title }))
        );
    }

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('Error loading the tasks:', error);
        return getCachedTasks(userId).concat(
            getPendingQueue(userId).map(title => ({ title }))
        );
    }

    const tasks = data || [];
    saveCachedTasks(tasks, userId);
    return tasks;
}

// Borra la tarea
export async function eraseTask(task, userId) {
    if (!navigator.onLine) {
        const wasPending = removeFromPendingQueue(task.taskTitle, userId);

        if (!wasPending) {
            addToPendingDeleteQueue(task.taskTitle, userId);
        }

        removeFromCache(task.taskTitle, userId);
        return;
    }

    const { data, error } = await supabase
        .from('tasks')
        .delete()
        .eq('title', task.taskTitle)
        .eq('user_id', userId);

    if (error) {
        console.error('Error deleting task:', error);
    } else {
        removeFromCache(task.taskTitle, userId);
    }
}

// Sincroniza inserciones y eliminaciones pendientes creadas offline
export async function syncPendingTasks(userId) {

    if (!navigator.onLine) return; 

    const pendingInserts = getPendingQueue(userId);
    const pendingDeletes = getPendingDeleteQueue(userId);

    if (pendingInserts.length > 0) {
        const { error } = await supabase
            .from('tasks')
            .insert(pendingInserts.map(title => ({ title, user_id: userId })));

        if (error) {
            console.error('Error syncing pending inserts:', error);
        } else {
            clearPendingQueue(userId);
            console.log('Pending inserts synced:', pendingInserts);
        }
    }

    if (pendingDeletes.length > 0) {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .in('title', pendingDeletes)
            .eq('user_id', userId);

        if (error) {
            console.error('Error syncing pending deletes:', error);
        } else {
            clearPendingDeleteQueue(userId);
            console.log('Pending deletes synced:', pendingDeletes);
        }
    }
}

// --- Helpers de caché (ahora por usuario) ---
function saveCachedTasks(tasks, userId) {
    localStorage.setItem(`${CACHE_KEY}_${userId}`, JSON.stringify(tasks));
}

function getCachedTasks(userId) {
    const cached = localStorage.getItem(`${CACHE_KEY}_${userId}`);
    return cached ? JSON.parse(cached) : [];
}

function removeFromCache(title, userId) {
    const cached = getCachedTasks(userId);
    const filtered = cached.filter(t => t.title !== title);
    saveCachedTasks(filtered, userId);
}

function addToCache(title, userId) {
    const cached = getCachedTasks(userId);
    const alreadyThere = cached.some(t => t.title === title);
    if (!alreadyThere) {
        cached.push({ title });
        saveCachedTasks(cached, userId);
    }
}

// --- Helpers de cola de inserciones (por usuario) ---
function getPendingQueue(userId) {
    const pending = localStorage.getItem(`${PENDING_KEY}_${userId}`);
    return pending ? JSON.parse(pending) : [];
}

function addToPendingQueue(title, userId) {
    const pending = getPendingQueue(userId);
    pending.push(title);
    localStorage.setItem(`${PENDING_KEY}_${userId}`, JSON.stringify(pending));
}

function removeFromPendingQueue(title, userId) {
    const pending = getPendingQueue(userId);
    const filtered = pending.filter(t => t !== title);
    const wasPending = filtered.length !== pending.length;
    localStorage.setItem(`${PENDING_KEY}_${userId}`, JSON.stringify(filtered));
    return wasPending;
}

function clearPendingQueue(userId) {
    localStorage.removeItem(`${PENDING_KEY}_${userId}`);
}

// --- Helpers de cola de eliminaciones (por usuario) ---
function getPendingDeleteQueue(userId) {
    const pending = localStorage.getItem(`${PENDING_DELETE_KEY}_${userId}`);
    return pending ? JSON.parse(pending) : [];
}

function addToPendingDeleteQueue(title, userId) {
    const pending = getPendingDeleteQueue(userId);
    pending.push(title);
    localStorage.setItem(`${PENDING_DELETE_KEY}_${userId}`, JSON.stringify(pending));
}

function clearPendingDeleteQueue(userId) {
    localStorage.removeItem(`${PENDING_DELETE_KEY}_${userId}`);
}