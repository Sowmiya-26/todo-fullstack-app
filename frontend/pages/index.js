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
    const res = await axios.get('https://todo-fullstack-app-njwt.onrender.com/todos', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTodos(res.data);
  };

  const addTodo = async () => {
    await axios.post(
      'https://todo-fullstack-app-njwt.onrender.com/todos',
      { title },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setTitle('');
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await axios.delete(`https://todo-fullstack-app-njwt.onrender.com/todos/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTodos();
  };

  const logout = () => {
    localStorage.removeItem('token');
    Router.push('/login');
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Your Todos</h1>
      <button onClick={logout}>Logout</button>
      <br /><br />
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder='New todo' />
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
