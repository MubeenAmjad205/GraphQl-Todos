import prisma from '@/lib/prisma';

export const resolvers = {
  Query: {
    todos: async () => {
      return await prisma.todo.findMany();
    },
  },
  Mutation: {
    addTodo: async (_: any, args: {
      task: string;
      priority?: number;
      description?: string;
      dueDate?: string;
      tags?: string[];
      assignedTo?: string;
      category?: string;
    }) => {
      // Parse dueDate if provided
      const dueDate = args.dueDate ? new Date(args.dueDate) : null;
      return await prisma.todo.create({
        data: {
          task: args.task,
          priority: args.priority ?? 1,
          description: args.description,
          dueDate: dueDate,
          tags: args.tags ?? [],
          assignedTo: args.assignedTo,
          category: args.category,
        },
      });
    },
    toggleTodoCompletion: async (_: any, { id }: { id: string }) => {
      const todo = await prisma.todo.findUnique({ where: { id } });
      if (!todo) throw new Error('Todo not found');
      return await prisma.todo.update({
        where: { id },
        data: { completed: !todo.completed },
      });
    },
    deleteTodo: async (_: any, { id }: { id: string }) => {
      await prisma.todo.delete({ where: { id } });
      return true;
    },
  },
};
