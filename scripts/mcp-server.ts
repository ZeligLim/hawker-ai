#!/usr/bin/env -S npx tsx

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use service role key to bypass RLS for admin actions via MCP
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase configuration in environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const server = new Server(
  {
    name: 'hawker-admin-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'add_dish',
        description: 'Add a new dish to a hawker stall/outlet',
        inputSchema: {
          type: 'object',
          properties: {
            food_outlet_id: { type: 'string' },
            name: { type: 'string' },
            category: { type: 'string' },
            price: { type: 'number' },
            is_vegetarian: { type: 'boolean' },
            spice_level: { type: 'number', description: '0-5' },
            description: { type: 'string' },
          },
          required: ['food_outlet_id', 'name', 'price'],
        },
      },
      {
        name: 'get_orders',
        description: 'Get recent orders',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', default: 10 },
          },
        },
      },
      {
        name: 'update_order_status',
        description: 'Update the status of an order (e.g. pending -> accepted -> ready -> completed)',
        inputSchema: {
          type: 'object',
          properties: {
            order_id: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'accepted', 'ready', 'completed', 'cancelled'] },
          },
          required: ['order_id', 'status'],
        },
      },
      {
        name: 'search_hawker_centres',
        description: 'Search for hawker centres in the DB',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
          },
        },
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (request.params.name === 'add_dish') {
      const args = request.params.arguments as any;
      const { data, error } = await supabase
        .from('menu_items')
        .insert([{
          food_outlet_id: args.food_outlet_id,
          name: args.name,
          category: args.category || 'Main course',
          price: args.price,
          is_vegetarian: args.is_vegetarian || false,
          spice_level: args.spice_level || 0,
          description: args.description || '',
          is_available: true
        }])
        .select();

      if (error) throw error;
      return { toolResult: data };
    }

    if (request.params.name === 'get_orders') {
      const args = request.params.arguments as any;
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(args.limit || 10);
      
      if (error) throw error;
      return { toolResult: data };
    }

    if (request.params.name === 'update_order_status') {
      const args = request.params.arguments as any;
      const { data, error } = await supabase
        .from('orders')
        .update({ status: args.status })
        .eq('id', args.order_id)
        .select();

      if (error) throw error;
      return { toolResult: data };
    }

    if (request.params.name === 'search_hawker_centres') {
      const args = request.params.arguments as any;
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .ilike('name', `%${args.query || ''}%`)
        .limit(10);
        
      if (error) throw error;
      return { toolResult: data };
    }

    throw new Error(`Unknown tool: ${request.params.name}`);
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error executing tool: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Hawker Admin MCP Server running on stdio');
}

main().catch((err) => {
  console.error('Server error:', err);
  process.exit(1);
});
