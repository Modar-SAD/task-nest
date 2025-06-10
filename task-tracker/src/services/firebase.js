// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBJze4Kw0NEcQ_81TuPONPUafDUEScEe5A",
    authDomain: "task-nest-ca9cb.firebaseapp.com",
    projectId: "task-nest-ca9cb",
    storageBucket: "task-nest-ca9cb.firebasestorage.app",
    messagingSenderId: "187424422202",
    appId: "1:187424422202:web:09da9caeb2eb151132b803",
    measurementId: "G-L2Q6C0LLG2"
  };

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const db = getFirestore(app);

// Task operations
export const taskService = {
  // Subscribe to user's tasks
  subscribeToTasks: (userId, onTasksUpdate) => {
    const tasksRef = collection(db, 'users', userId, 'tasks');
    return onSnapshot(tasksRef, 
      (snapshot) => {
        const tasks = {
          todo: [],
          inProgress: [],
          done: []
        };
        
        snapshot.forEach((doc) => {
          const task = { id: doc.id, ...doc.data() };
          // Convert Firestore Timestamp to Date
          if (task.deadline) {
            task.deadline = task.deadline.toDate();
          }
          tasks[task.status].push(task);
        });
        
        onTasksUpdate(tasks);
      },
      (error) => {
        console.error('Error fetching tasks:', error);
        throw new Error('Failed to fetch tasks. Please try again later.');
      }
    );
  },

  // Add a new task
  addTask: async (userId, task) => {
    try {
      const tasksRef = collection(db, 'users', userId, 'tasks');
      const newTaskRef = doc(tasksRef);
      
      await setDoc(newTaskRef, {
        ...task,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return newTaskRef.id;
    } catch (error) {
      console.error('Error adding task:', error);
      throw new Error('Failed to add task. Please try again later.');
    }
  },

  // Update a task
  updateTask: async (userId, taskId, updates) => {
    try {
      const taskRef = doc(db, 'users', userId, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task. Please try again later.');
    }
  },

  // Delete a task
  deleteTask: async (userId, taskId) => {
    try {
      const taskRef = doc(db, 'users', userId, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task. Please try again later.');
    }
  }
};

export { auth, googleProvider, githubProvider, db };
