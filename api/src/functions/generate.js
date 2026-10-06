const { app } = require('@azure/functions')

const testResult = {
  title: 'AIと地域がつながる福島',
  vision2036: '2036年の福島では、地域の人々とAIが協力し、それぞれの地域が持つ魅力や課題に合わせた新しい取り組みが生まれています。',
  aiRoles: [
    '必要な情報を探す',
    '新しいアイデアを提案する',
    'さまざまな情報を整理する',
  ],
  humanRoles: [
    'どんな未来を実現したいか考える',
    '地域の人と話し合う',
    '最終的な意思決定をする',
  ],
  firstStep: '身近な地域の課題を一つ見つけ、AIに相談してみましょう',
}

app.http('generate', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request) => {
    await request.json()

    return { jsonBody: testResult }
  },
})