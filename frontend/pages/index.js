import { useState, useEffect } from 'react';
import axios from 'axios';
import Router from 'next/router';

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      Router.push('/login');
    } else {
      fetchTodos(token);
    }
  }, []);

  const fetchTodos = async (token) => {
    try {
      const res = await axios.get('https://todo-fullstack-app-njwt.onrender.com/todos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos(res.data);
    } catch (err) {
      console.error('Auth failed. Redirecting...');
      localStorage.removeItem('token');
      Router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    const token = localStorage.getItem('token');
    await axios.post(
      'https://todo-fullstack-app-njwt.onrender.com/todos',
      { title },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setTitle('');
    fetchTodos(token);
  };

  const deleteTodo = async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`https://todo-fullstack-app-njwt.onrender.com/todos/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTodos(token);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Your Todos</h1>
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
