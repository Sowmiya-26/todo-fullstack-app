import { useState, useEffect } from 'react';
import axios from 'axios';
import Router from 'next/router';

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) Router.push('/login');
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const res = await axios.get('http://localhost:5000/todos', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTodos(res.data);
  };

  const addTodo = async () => {
    await axios.post(
      'http://localhost:5000/todos',
      { title },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setTitle('');
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await axios.delete(`http://localhost:5000/todos/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTodos();
  };

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
