'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchGraphQL } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ADD_TODO_MUTATION = `
  mutation AddTodo(
    $task: String!, 
    $priority: Int!, 
    $description: String!, 
    $dueDate: String!, 
    $tags: [String!]!, 
    $assignedTo: String!, 
    $category: String!
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

interface FormValues {
  task: string;
  priority: number;
  description: string;
  dueDate: string;
  tags: string;
  assignedTo: string;
  category: string;
}

export default function TodoForm() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      task: '',
      priority: 1,
      description: '',
      dueDate: '',
      tags: '',
      assignedTo: '',
      category: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (newTodo: FormValues) => {
      const variables = {
        ...newTodo,
        tags: newTodo.tags.split(',').map((t) => t.trim()),
      };
      const result = await fetchGraphQL(ADD_TODO_MUTATION, variables);
      if (result.errors) throw new Error(result.errors[0].message);
      return result.data.addTodo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries<any>(['todos']);
      toast.success('Todo added successfully!');
      reset(); 
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="mb-4 p-4 border rounded shadow">
        <div className="mb-2">
          <input
            type="text"
            placeholder="Task"
            {...register('task', { required: 'Task is required' })}
            className="border p-2 w-full"
          />
          {errors.task && <p className="text-red-500 text-sm">{errors.task.message}</p>}
        </div>
        <div className="mb-2 flex space-x-2">
          <div className="w-1/3">
            <input
              type="number"
              placeholder="Priority"
              {...register('priority', { 
                required: 'Priority is required', 
                valueAsNumber: true 
              })}
              className="border p-2 w-full"
            />
            {errors.priority && <p className="text-red-500 text-sm">{errors.priority.message}</p>}
          </div>
          <div className="w-2/3">
            <input
              type="text"
              placeholder="Description"
              {...register('description', { required: 'Description is required' })}
              className="border p-2 w-full"
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>
        </div>
        <div className="mb-2 flex space-x-2">
          <div className="w-1/2">
            <input
              type="date"
              placeholder="Due Date"
              {...register('dueDate', { required: 'Due Date is required' })}
              className="border p-2 w-full"
            />
            {errors.dueDate && <p className="text-red-500 text-sm">{errors.dueDate.message}</p>}
          </div>
          <div className="w-1/2">
            <input
              type="text"
              placeholder="Tags (comma separated)"
              {...register('tags', { required: 'Tags are required' })}
              className="border p-2 w-full"
            />
            {errors.tags && <p className="text-red-500 text-sm">{errors.tags.message}</p>}
          </div>
        </div>
        <div className="mb-2 flex space-x-2">
          <div className="w-1/2">
            <input
              type="text"
              placeholder="Assigned To"
              {...register('assignedTo', { required: 'Assigned To is required' })}
              className="border p-2 w-full"
            />
            {errors.assignedTo && <p className="text-red-500 text-sm">{errors.assignedTo.message}</p>}
          </div>
          <div className="w-1/2">
            <input
              type="text"
              placeholder="Category"
              {...register('category', { required: 'Category is required' })}
              className="border p-2 w-full"
            />
            {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
          </div>
        </div>
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Add Todo
        </button>
      </form>
      <ToastContainer />
    </>
  );
}
