// app/todo/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchGraphQL } from '@/lib/api';
import { FiArrowLeft } from 'react-icons/fi';
import { useEffect, useState } from 'react';

const TODO_QUERY = `
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

export default function TodoDetail() {
    const [id, setId] = useState('');
  const router = useRouter();
  const  params  = useParams();
  useEffect(() => {  
    const getId = async () => {  
        try {
            
          const resolvedParams = await params; // Resolve the params promise    7
          // If the resolvedParams are not an object or doesn't contain an id key, throw an error  8
          if (!resolvedParams || typeof resolvedParams!== 'object' ||!resolvedParams.id) {
            throw new Error('Invalid or missing id parameter');
          } 
          let id:any = resolvedParams.id
          setId(id); // Set the ID once resolved  
        } catch (error) {
          console.error("Error resolving params:", error);
        }
      }; 

    getId();  
  }, [params]);  

  const { data, isLoading, error } = useQuery({
    queryKey: ['todo', id],
    queryFn: async () => {
      const result = await fetchGraphQL(TODO_QUERY);
      if(result.errors) throw new Error(result.errors[0].message);
      return result.data.todos.find((todo: any) => todo.id === id);
    },
    enabled: !!id,
  });

  if(isLoading) return <div>Loading...</div>;
  if(error || !data) return <div>Error loading todo detail.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button onClick={() => router.back()} className="flex items-center text-blue-500 mb-4">
        <FiArrowLeft className="mr-2" /> Back
      </button>
      <h1 className="text-3xl font-bold mb-4">{data.task}</h1>
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
    </div>
  );
}
