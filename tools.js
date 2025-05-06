const { FunctionTool } = require('openai-agents');

const weatherTool = new FunctionTool({
    name: 'get_weather',
    description: 'Returns weather',
    params_json_schema: {
      type: 'object',
      properties: {
        city: { type: 'string' }
      },
      required: ['city']
    },
    on_invoke_tool: async ({ input }) => {
      return `Weather in ${input.city} is sunny.`;
    }
  });
  
  module.exports = { weatherTool };