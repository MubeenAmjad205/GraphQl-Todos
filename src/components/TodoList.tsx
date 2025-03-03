// src/components/TodoList.tsx
'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchGraphQL } from '@/lib/api';
import TodoItem from '@/components/TodoItem';
import TodoForm from '@/components/TodoForm';
import { FiRefreshCw } from 'react-icons/fi';

const TODOS_QUERY = `
  query {
    todos {
      id
      task
      completed
      priority
      description
      dueDate
      createdAt
      updatedAt
      tags
      assignedTo
      category
    }
  }
`;

export default function TodoList() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const result = await fetchGraphQL(TODOS_QUERY);
      if(result.errors) throw new Error(result.errors[0].message);
      return result.data.todos;
    }
  });

  if(isLoading) return <div>Loading...</div>;
  if(error) return <div>Error loading todos.</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Todo List</h1>
        <button
          onClick={() => queryClient.invalidateQueries<any>(['todos'])}
          className="p-2 rounded bg-blue-500 text-white flex items-center"
        >
          <FiRefreshCw className="mr-2" />
          Refresh
        </button>
      </div>
      <TodoForm />
      <ul className="divide-y">
        {data.map((todo: any) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    </div>
  );
}
