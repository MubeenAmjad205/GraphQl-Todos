'use client';

import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchGraphQL } from '@/lib/api';
import { FiCheckSquare, FiSquare, FiTrash2, FiEdit } from 'react-icons/fi';

interface Todo {
  id: string;
  task: string;
  completed: boolean;
  priority: number;
  description?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  assignedTo?: string;
  category?: string;
}

const TOGGLE_TODO_MUTATION = `
  mutation ToggleTodo($id: ID!) {
    toggleTodoCompletion(id: $id) {
      id
      completed
    }
  }
`;

const DELETE_TODO_MUTATION = `
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id)
  }
`;

export default function TodoItem({ todo }: { todo: Todo }) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await fetchGraphQL(TOGGLE_TODO_MUTATION, { id });
      if(result.errors) throw new Error(result.errors[0].message);
      return result.data.toggleTodoCompletion;
    },
    onSuccess: () => queryClient.invalidateQueries<any>(['todos'])
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await fetchGraphQL(DELETE_TODO_MUTATION, { id });
      if(result.errors) throw new Error(result.errors[0].message);
      return result.data.deleteTodo;
    },
    onSuccess: () => queryClient.invalidateQueries<any>(['todos'])
  });

  return (
    <li className="flex justify-between items-center p-2 border-b">
      <div className="flex items-center space-x-2">
        <button onClick={() => toggleMutation.mutate(todo.id)}>
          {todo.completed ? (
            <FiCheckSquare className="text-green-500" />
          ) : (
            <FiSquare />
          )}
        </button>
        <span className={todo.completed ? 'line-through' : ''}>
          {todo.task}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <Link href={`/todo/${todo.id}`}>
          <FiEdit className="cursor-pointer" />
        </Link>
        <button onClick={() => deleteMutation.mutate(todo.id)}>
          <FiTrash2 className="cursor-pointer text-red-500" />
        </button>
      </div>
    </li>
  );
}
