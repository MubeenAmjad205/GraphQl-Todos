// src/components/TodoForm.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchGraphQL } from '@/lib/api';

const ADD_TODO_MUTATION = `
  mutation AddTodo(
    $task: String!, 
    $priority: Int, 
    $description: String, 
    $dueDate: String, 
    $tags: [String!], 
    $assignedTo: String, 
    $category: String
  ) {
    addTodo(
      task: $task, 
      priority: $priority, 
      description: $description, 
      dueDate: $dueDate, 
      tags: $tags, 
      assignedTo: $assignedTo, 
      category: $category
    ) {
      id
      task
      completed
    }
  }
`;

export default function TodoForm() {
  const queryClient = useQueryClient();
  const [task, setTask] = useState('');
  const [priority, setPriority] = useState(1);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [category, setCategory] = useState('');

  const mutation = useMutation({
    mutationFn: async (newTodo: any) => {
      const variables = { ...newTodo };
      const result = await fetchGraphQL(ADD_TODO_MUTATION, variables);
      if(result.errors) throw new Error(result.errors[0].message);
      return result.data.addTodo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries<any>(['todos']);
      // Reset form fields
      setTask('');
      setPriority(1);
      setDescription('');
      setDueDate('');
      setTags('');
      setAssignedTo('');
      setCategory('');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTodo = {
      task,
      priority,
      description,
      dueDate: dueDate || null,
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      assignedTo,
      category,
    };
    mutation.mutate(newTodo);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded shadow">
      <div className="mb-2">
        <input
          type="text"
          placeholder="Task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="border p-2 w-full"
          required
        />
      </div>
      <div className="mb-2 flex space-x-2">
        <input
          type="number"
          placeholder="Priority"
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
          className="border p-2 w-1/3"
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 w-2/3"
        />
      </div>
      <div className="mb-2 flex space-x-2">
        <input
          type="date"
          placeholder="Due Date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="border p-2 w-1/2"
        />
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="border p-2 w-1/2"
        />
      </div>
      <div className="mb-2 flex space-x-2">
        <input
          type="text"
          placeholder="Assigned To"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="border p-2 w-1/2"
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 w-1/2"
        />
      </div>
      <button type="submit" className="bg-green-500 text-white p-2 rounded">
        Add Todo
      </button>
    </form>
  );
}
