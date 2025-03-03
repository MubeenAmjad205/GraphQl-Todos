'use client';
// app/page.tsx
import TodoList from '@/components/TodoList';

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <TodoList />
      
    </div>
  );
}
