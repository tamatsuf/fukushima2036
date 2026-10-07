import { useState } from 'react'
import './App.css'

const roles = [
  '学生',
  '会社員',
  '経営者・個人事業主',
  '自治体職員',
  '教育関係者',
  '地域で暮らす人',
  'その他',
]

const themes = [
  '働く',
  '学ぶ',
  '暮らす',
  '観光',
  '農業・食',
  'ものづくり',
  '子育て',
  '医療・福祉',
  '防災',
  '移動',
  '地域コミュニティ',
  '環境・エネルギー',
]

const stepLabels = ['スタート', '立場', 'テーマ', '自由入力', '結果']

function App() {
  const [step, setStep] = useState(0)
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('')
  const [idea, setIdea] = useState('')
  const [result, setResult] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const apiUrl = import.meta.env.VITE_API_URL || '/api/generate'

  const currentStep = stepLabels[step]

  const goNext = () => setStep((current) => Math.min(current + 1, 4))
  const goBack = () => setStep((current) => Math.max(current - 1, 0))

  const canGenerate = idea.trim().length > 0

  const generateResult = async () => {
    setIsGenerating(true)
    setErrorMessage('')

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole, theme: selectedTheme, idea }),
      })

      if (!response.ok) {
        let errorDetails = '未来アイデアの生成に失敗しました。'
        try {
          const errorBody = await response.json()
          if (typeof errorBody?.error === 'string' && errorBody.error) {
            errorDetails = errorBody.error
          }
        } catch {
          // Ignore invalid JSON error responses.
        }
        throw new Error(`${response.status}: ${errorDetails}`)
      }

      setResult(await response.json())
      goNext()
    } catch (error) {
      console.error('Failed to generate future idea:', error)
      setErrorMessage(error instanceof Error ? error.message : '未来アイデアの生成に失敗しました。もう一度お試しください。')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="app-shell">
      <div className="progress-bar" aria-label={`現在のステップ ${step + 1}/5`}>
        <div className="progress-fill" style={{ width: `${((step + 1) / 5) * 100}%` }} />
      </div>

      <header className="topbar">
        <span className="topbar-step">STEP {step + 1}</span>
        <span className="topbar-label">{currentStep}</span>
      </header>

      {step === 0 && (
        <section className="screen start-screen" aria-labelledby="start-title">
          <div className="sun" aria-hidden="true" />
          <div className="title-badge">2036年の福島を描く</div>
          <h1 id="start-title">ふくしま2036</h1>
          <p className="lead">AIと一緒に、10年後の福島を描いてみよう</p>
          <button type="button" className="primary-button" onClick={goNext}>
            はじめる
            <span aria-hidden="true">→</span>
          </button>
        </section>
      )}

      {step === 1 && (
        <section className="screen" aria-labelledby="role-title">
          <p className="screen-label">STEP 1</p>
          <h2 id="role-title">自分の立場を選ぼう</h2>
          <div className="option-grid" role="list">
            {roles.map((role) => (
              <button
                key={role}
                type="button"
                className={selectedRole === role ? 'option-button selected' : 'option-button'}
                onClick={() => {
                  setSelectedRole(role)
                  goNext()
                }}
                role="listitem"
              >
                {role}
              </button>
            ))}
          </div>
          <button type="button" className="secondary-button" onClick={goBack}>戻る</button>
        </section>
      )}

      {step === 2 && (
        <section className="screen" aria-labelledby="theme-title">
          <p className="screen-label">STEP 2</p>
          <h2 id="theme-title">テーマを選ぼう</h2>
          <div className="option-grid theme-grid" role="list">
            {themes.map((theme) => (
              <button
                key={theme}
                type="button"
                className={selectedTheme === theme ? 'option-button selected' : 'option-button'}
                onClick={() => {
                  setSelectedTheme(theme)
                  goNext()
                }}
                role="listitem"
              >
                {theme}
              </button>
            ))}
          </div>
          <button type="button" className="secondary-button" onClick={goBack}>戻る</button>
        </section>
      )}

      {step === 3 && (
        <section className="screen" aria-labelledby="input-title">
          <p className="screen-label">STEP 3</p>
          <h2 id="input-title">2036年までに、福島で変えたいことを教えてください</h2>
          <label className="input-label" htmlFor="future-idea">
            どんな未来を実現したいですか？
          </label>
          <textarea
            id="future-idea"
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
            placeholder="例：地域の人が気軽に学び合える場所を増やしたい。"
            rows="6"
          />
          <button
            type="button"
            className="primary-button"
            onClick={generateResult}
            disabled={!canGenerate || isGenerating}
          >
            AIと未来を描く
          </button>
          {isGenerating && <p className="status-message" role="status">2036年の福島を描いています...</p>}
          {errorMessage && <p className="status-message error-message" role="alert">{errorMessage}</p>}
          <button type="button" className="secondary-button" onClick={goBack}>戻る</button>
        </section>
      )}

      {step === 4 && (
        <section className="screen result-screen" aria-labelledby="result-title">
          <p className="screen-label">STEP 4</p>
          <h2 id="result-title">あなたが描く ふくしま2036</h2>

          <article className="result-card title-card">
            <p className="card-label">未来のタイトル</p>
            <h3>{result.title}</h3>
            <p>{`${selectedTheme || '地域の未来'}を中心に、${selectedRole || '福島に暮らす人'}の視点から描く2036年。`}</p>
          </article>

          <article className="result-card blue-card">
            <p className="card-label">2036年の姿</p>
            <p>{result.vision2036}</p>
          </article>

          <article className="result-card">
            <p className="card-label">AIができること</p>
            <ul>
              {result.aiRoles.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>

          <article className="result-card">
            <p className="card-label">人にしかできないこと</p>
            <ul>
              {result.humanRoles.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>

          <article className="result-card green-card">
            <p className="card-label">明日から始める小さな一歩</p>
            <p>{result.firstStep}</p>
          </article>

          <button type="button" className="secondary-button" onClick={() => setStep(0)}>
            最初からやり直す
          </button>
        </section>
      )}
    </main>
  )
}

export default App
