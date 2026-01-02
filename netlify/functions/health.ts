import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    },
    body: JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Planning App API',
      environment: process.env.NODE_ENV || 'development'
    })
  };
};
