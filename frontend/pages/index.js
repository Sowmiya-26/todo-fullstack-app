import { useState, useEffect } from 'react';
import axios from 'axios';
import Router from 'next/router';

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      Router.push('/login');
    } else {
      fetchTodos();
    }
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await axios.get('https://todo-fullstack-app-njwt.onrender.com/todos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos(res.data);
    } catch (err) {
      console.error('Failed to fetch todos:', err);
    }
  };

  const addTodo = async () => {
    try {
      await axios.post(
        'https://todo-fullstack-app-njwt.onrender.com/todos',
        { title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle('');
      fetchTodos();
    } catch (err) {
      console.error('Failed to add todo:', err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`https://todo-fullstack-app-njwt.onrender.com/todos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTodos();
    } catch (err) {
      console.error('Failed to delete todo:', err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Your Todos</h1>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New todo" />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.title}
            <button onClick={() => deleteTodo(todo.id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
