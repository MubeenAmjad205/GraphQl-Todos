'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchGraphQL } from '@/lib/api';
import { FiArrowLeft, FiEdit, FiSave, FiX } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TODO_QUERY = `
  query Todo($id: ID!) {
    todo(id: $id) {
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

const EDIT_TODO_MUTATION = `
  mutation UpdateTodo(
    $id: ID!
    $task: String
    $priority: Int
    $description: String
    $dueDate: String
    $tags: [String!]
    $assignedTo: String
    $category: String
  ) {
    updateTodo(
      id: $id
      task: $task
      priority: $priority
      description: $description
      dueDate: $dueDate
      tags: $tags
      assignedTo: $assignedTo
      category: $category
    ) {
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

export default function TodoDetailClient({ params }: { params: any }) {
  const [id, setId] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {  
    const getId = async () => {  
      try {
        const resolvedParams = await params;
        if (!resolvedParams || typeof resolvedParams !== 'object' || !resolvedParams.id) {
          throw new Error('Invalid or missing id parameter');
        } 
        setId(resolvedParams.id); 
      } catch (error) {
        console.error("Error resolving params:", error);
        toast.error("Error resolving route parameters.");
      }
    }; 
    getId();  
  }, [params]); 

  const { data, isLoading, error } = useQuery({
    queryKey: ['todo', id],
    queryFn: async () => {
      console.log('Fetching todo for id:', id);
      const result = await fetchGraphQL(TODO_QUERY, { id });
      console.log('GraphQL result:', result);
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      return result.data.todo;
    },
    enabled: !!id,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({
    task: '',
    priority: 1,
    description: '',
    dueDate: '',
    tags: '',
    assignedTo: '',
    category: ''
  });

  useEffect(() => {
    if (!isEditing && data && formState.task === '') {
      setFormState({
        task: data.task,
        priority: data.priority,
        description: data.description || '',
        dueDate: data.dueDate ? data.dueDate.split('T')[0] : '',
        tags: data.tags.join(', '),
        assignedTo: data.assignedTo || '',
        category: data.category || ''
      });
    }
  }, [data, isEditing, formState.task]);

  const editMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const result = await fetchGraphQL(EDIT_TODO_MUTATION, updatedData);
      if (result.errors) throw new Error(result.errors[0].message);
      return result.data.updateTodo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries<any>(['todo', id]);
      toast.success('Todo updated successfully!');
      setIsEditing(false);
    },
    onError: (err: any) => {
      toast.error(`Error updating todo: ${err.message}`);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formState.task ||
      !formState.priority ||
      !formState.description ||
      !formState.dueDate ||
      !formState.tags ||
      !formState.assignedTo ||
      !formState.category
    ) {
      toast.error('Please fill in all required fields.');
      return;
    }
    const updatedData = {
      id,
      task: formState.task,
      priority: Number(formState.priority),
      description: formState.description,
      dueDate: formState.dueDate || null,
      tags: formState.tags.split(',').map((tag) => tag.trim()),
      assignedTo: formState.assignedTo,
      category: formState.category
    };
    editMutation.mutate(updatedData);
  };

  if (!id || isLoading) return <div>Loading...</div>;
  if (error || !data) return <div>Error loading todo detail.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button onClick={() => router.back()} className="flex items-center text-blue-500 mb-4">
        <FiArrowLeft className="mr-2" /> Back
      </button>
      
      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="mb-4 p-4 border rounded shadow">
          <div className="mb-2">
            <label className="block font-bold">Task:</label>
            <input
              type="text"
              name="task"
              value={formState.task}
              onChange={handleChange}
              className="border p-2 w-full"
              required
            />
          </div>
          <div className="mb-2 flex space-x-2">
            <div className="w-1/3">
              <label className="block font-bold">Priority:</label>
              <input
                type="number"
                name="priority"
                value={formState.priority}
                onChange={handleChange}
                className="border p-2 w-full"
                required
              />
            </div>
            <div className="w-2/3">
              <label className="block font-bold">Description:</label>
              <input
                type="text"
                name="description"
                value={formState.description}
                onChange={handleChange}
                className="border p-2 w-full"
                required
              />
            </div>
          </div>
          <div className="mb-2 flex space-x-2">
            <div className="w-1/2">
              <label className="block font-bold">Due Date:</label>
              <input
                type="date"
                name="dueDate"
                value={formState.dueDate}
                onChange={handleChange}
                className="border p-2 w-full"
                required
              />
            </div>
            <div className="w-1/2">
              <label className="block font-bold">Tags:</label>
              <input
                type="text"
                name="tags"
                value={formState.tags}
                onChange={handleChange}
                placeholder="Comma separated"
                className="border p-2 w-full"
                required
              />
            </div>
          </div>
          <div className="mb-2 flex space-x-2">
            <div className="w-1/2">
              <label className="block font-bold">Assigned To:</label>
              <input
                type="text"
                name="assignedTo"
                value={formState.assignedTo}
                onChange={handleChange}
                className="border p-2 w-full"
                required
              />
            </div>
            <div className="w-1/2">
              <label className="block font-bold">Category:</label>
              <input
                type="text"
                name="category"
                value={formState.category}
                onChange={handleChange}
                className="border p-2 w-full"
                required
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button type="submit" className="bg-green-500 text-white p-2 rounded flex items-center">
              <FiSave className="mr-2" /> Save
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-500 text-white p-2 rounded flex items-center">
              <FiX className="mr-2" /> Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">{data.task}</h1>
            <button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white p-2 rounded flex items-center">
              <FiEdit className="mr-2" /> Edit
            </button>
          </div>
          <p><strong>Description:</strong> {data.description}</p>
          <p><strong>Priority:</strong> {data.priority}</p>
          <p>
            <strong>Due Date:</strong>{' '}
            {data.dueDate ? new Date(data.dueDate).toLocaleDateString() : 'N/A'}
          </p>
          <p><strong>Assigned To:</strong> {data.assignedTo}</p>
          <p><strong>Category:</strong> {data.category}</p>
          <div className="mt-4">
            <strong>Tags:</strong>
            <ul className="list-disc list-inside">
              {data.tags.map((tag: string) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>
        </>
      )}
      <ToastContainer />
    </div>
  );
}
