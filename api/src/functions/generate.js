const { app } = require('@azure/functions')

const resultSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    vision2036: { type: 'string' },
    aiRoles: { type: 'array', items: { type: 'string' } },
    humanRoles: { type: 'array', items: { type: 'string' } },
    firstStep: { type: 'string' },
  },
  required: ['title', 'vision2036', 'aiRoles', 'humanRoles', 'firstStep'],
  additionalProperties: false,
}

function getBaseURL(endpoint) {
  const normalizedEndpoint = endpoint.trim().replace(/\/+$/, '')
  return `${normalizedEndpoint.replace(/\/openai\/v1(?:\/responses)?\/?$/, '')}/openai/v1/`
}

app.http('generate', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request) => {
    let input
    try {
      input = await request.json()
    } catch {
      return { status: 400, jsonBody: { error: 'Request body must be valid JSON.' } }
    }

    const role = typeof input?.role === 'string' ? input.role.trim() : ''
    const theme = typeof input?.theme === 'string' ? input.theme.trim() : ''
    const idea = typeof input?.idea === 'string' ? input.idea.trim() : ''

    if (!role || !theme || !idea || role.length > 200 || theme.length > 200 || idea.length > 2000) {
      return { status: 400, jsonBody: { error: 'Role, theme, and idea are required and must be within the allowed length.' } }
    }

    const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim()
    const apiKey = process.env.AZURE_OPENAI_API_KEY
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT?.trim()
    const missingSettings = [
      !endpoint && 'AZURE_OPENAI_ENDPOINT',
      !apiKey && 'AZURE_OPENAI_API_KEY',
      !deployment && 'AZURE_OPENAI_DEPLOYMENT',
    ].filter(Boolean)

    if (missingSettings.length > 0) {
      console.error('Azure OpenAI configuration is missing:', missingSettings.join(', '))
      return { status: 503, jsonBody: { error: 'Generation service is not configured.' } }
    }
    console.info('Azure OpenAI config check', {
      endpointConfigured: Boolean(endpoint),
      apiKeyConfigured: Boolean(apiKey),
      deploymentConfigured: Boolean(deployment),
      deployment,
      baseURL: getBaseURL(endpoint),
    })
    try {
      const OpenAI = require('openai')
      const client = new OpenAI({
        apiKey,
        baseURL: getBaseURL(endpoint),
        maxRetries: 0,
        timeout: 120_000,
      })

      const response = await client.responses.create({
        model: deployment,
        instructions: [
          'あなたは「ふくしま2036」の未来アイデア作成アシスタントです。',
          '参加者の立場、テーマ、希望を尊重し、2036年の福島について具体的で前向きな案を日本語で作成してください。',
          '毎回、title、vision2036、aiRoles、humanRoles、firstStepの5項目だけをJSONとして返してください。',
          'aiRolesとhumanRolesは最小限の配列にし、記事のように長くしないでください。',
        ].join('\n'),
        input: JSON.stringify({ role, theme, idea }),
        max_output_tokens: 256,
        text: {
          verbosity: 'medium',
          format: {
            type: 'json_schema',
            name: 'fukushima2036_idea',
            strict: true,
            schema: resultSchema,
          },
        },
      })

      if (!response.output_text) {
        throw new Error('The model returned no output text.')
      }

      const jsonBody = JSON.parse(response.output_text)
      if (!Array.isArray(jsonBody.aiRoles) || !Array.isArray(jsonBody.humanRoles)) {
        throw new Error('The model returned an invalid result schema.')
      }

      return { jsonBody }
    } catch (error) {
      console.error('Failed to generate Fukushima 2036 idea:', {
        name: error?.name,
        message: error?.message,
        status: error?.status,
        code: error?.code,
      })
      return { status: 502, jsonBody: { error: 'Failed to generate the future idea.' } }
    }
  },
})