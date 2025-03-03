// src/lib/api.ts
import axios from 'axios';

const API_URL = '/api/graphql';

export const fetchGraphQL = async (query: string, variables = {}) => {
  const response = await axios.post(API_URL, { query, variables });
  return response.data;
};
