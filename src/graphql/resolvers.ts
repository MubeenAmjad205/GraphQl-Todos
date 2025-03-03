import prisma from '@/lib/prisma';

export const resolvers = {
  Query: {
    todos: async () => {
      return await prisma.todo.findMany();
    },
    todo: async (_: any, { id }: { id: string }) => {
        return await prisma.todo.findUnique({
          where: { id },
        });
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
    updateTodo: async (_: any, args: {
      id: string;
      task?: string;
      priority?: number;
      description?: string;
      dueDate?: string;
      tags?: string[];
      assignedTo?: string;
      category?: string;
    }) => {
      // Build update data dynamically based on provided fields
      const data: any = {};
      if (args.task !== undefined) data.task = args.task;
      if (args.priority !== undefined) data.priority = args.priority;
      if (args.description !== undefined) data.description = args.description;
      if (args.dueDate !== undefined)
        data.dueDate = args.dueDate ? new Date(args.dueDate) : null;
      if (args.tags !== undefined) data.tags = args.tags;
      if (args.assignedTo !== undefined) data.assignedTo = args.assignedTo;
      if (args.category !== undefined) data.category = args.category;

      return await prisma.todo.update({
        where: { id: args.id },
        data,
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
