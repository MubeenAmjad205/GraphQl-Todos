import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Todo {
    id: ID!
    task: String!
    completed: Boolean!
    priority: Int!
    description: String
    dueDate: String
    createdAt: String!
    updatedAt: String!
    tags: [String!]!
    assignedTo: String
    category: String
  }

  type Query {
    todos: [Todo!]!
  }

  type Mutation {
    addTodo(
      task: String!
      priority: Int
      description: String
      dueDate: String
      tags: [String!]
      assignedTo: String
      category: String
    ): Todo!
    toggleTodoCompletion(id: ID!): Todo!
    deleteTodo(id: ID!): Boolean!
  }
`;
