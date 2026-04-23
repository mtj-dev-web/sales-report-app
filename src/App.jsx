import { useState, useEffect, useCallback } from 'react'

// ────────────────────────────────────────────────
// 定数・ユーティリティ
// ────────────────────────────────────────────────

const OUTCOMES = ['商談成立', '提案', '情報収集', 'フォローアップ', 'クレーム対応', '新規開拓', 'その他']

const OUTCOME_STYLE = {
  '商談成立':     { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500',  bar: 'bg-green-500'  },
  '提案':         { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-500',   bar: 'bg-blue-500'   },
  '情報収集':     { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500', bar: 'bg-purple-500' },
  'フォローアップ': { bg: 'bg-cyan-100',   text: 'text-cyan-800',   dot: 'bg-cyan-500',   bar: 'bg-cyan-500'   },
  'クレーム対応': { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-500',    bar: 'bg-red-500'    },
  '新規開拓':     { bg: 'bg-amber-100',  text: 'text-amber-800',  dot: 'bg-amber-500',  bar: 'bg-amber-500'  },
  'その他':       { bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400',   bar: 'bg-gray-400'   },
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function formatDate(d) {
  if (!d) return ''
  const [y, m, dd] = d.split('-')
  return `${y}年${m}月${dd}日`
}

function getThisMonthPrefix() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const STORAGE_KEY = 'sales_reports_v1'

function loadReports() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}

// ────────────────────────────────────────────────
// Toast コンポーネント
// ────────────────────────────────────────────────

function Toast({ message }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                    bg-gray-900 text-white text-sm font-medium
                    px-5 py-2.5 rounded-lg shadow-xl
                    animate-[fadeUp_0.25s_ease]
                    whitespace-nowrap pointer-events-none">
      {message}
    </div>
  )
}

// ────────────────────────────────────────────────
// OutcomeBadge コンポーネント
// ────────────────────────────────────────────────

function OutcomeBadge({ outcome }) {
  const s = OUTCOME_STYLE[outcome] || OUTCOME_STYLE['その他']
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5
                      rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {outcome}
    </span>
  )
}

// ────────────────────────────────────────────────
// ReportForm コンポーネント
// ────────────────────────────────────────────────

const INITIAL_FORM = {
  date: todayStr(),
  name: '',
  company: '',
  content: '',
  outcome: '提案',
  followDate: '',
}

function ReportForm({ onSubmit }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name    = '担当者名を入力してください'
    if (!form.company.trim()) e.company = '訪問先企業を入力してください'
    if (!form.content.trim()) e.content = '営業内容を入力してください'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 450))
    onSubmit(form)
    setForm({ ...INITIAL_FORM, date: todayStr(), name: form.name }) // 担当者名だけ維持
    setErrors({})
    setLoading(false)
  }

  const inputClass = (err) =>
    `w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-800
     outline-none transition focus:ring-2
     ${err
       ? 'border-red-400 focus:ring-red-100 focus:border-red-400'
       : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'}`

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h2 className="text-sm font-bold text-gray-700 mb-4
                     pb-3 border-b border-gray-100 tracking-wide">
        日報を記録する
      </h2>

      {/* 日付 */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          日付
        </label>
        <input
          type="date"
          className={inputClass(false)}
          value={form.date}
          onChange={e => set('date', e.target.value)}
        />
      </div>

      {/* 営業担当者名 */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          営業担当者名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className={inputClass(errors.name)}
          placeholder="山田 太郎"
          value={form.name}
          onChange={e => set('name', e.target.value)}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <span>⚠</span>{errors.name}
          </p>
        )}
      </div>

      {/* 訪問先企業 */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          訪問先企業 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className={inputClass(errors.company)}
          placeholder="株式会社〇〇"
          value={form.company}
          onChange={e => set('company', e.target.value)}
        />
        {errors.company && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <span>⚠</span>{errors.company}
          </p>
        )}
      </div>

      {/* 営業内容 */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          営業内容 <span className="text-red-500">*</span>
        </label>
        <textarea
          className={`${inputClass(errors.content)} resize-y min-h-[100px] leading-relaxed`}
          placeholder="今日の営業活動の詳細を記入してください..."
          value={form.content}
          onChange={e => set('content', e.target.value)}
        />
        {errors.content && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <span>⚠</span>{errors.content}
          </p>
        )}
      </div>

      {/* 成果 */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          成果
        </label>
        <select
          className={`${inputClass(false)} appearance-none bg-white cursor-pointer`}
          value={form.outcome}
          onChange={e => set('outcome', e.target.value)}
        >
          {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      {/* 次回フォロー予定日 */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          次回フォロー予定日
        </label>
        <input
          type="date"
          className={inputClass(false)}
          value={form.followDate}
          min={todayStr()}
          onChange={e => set('followDate', e.target.value)}
        />
      </div>

      {/* 送信ボタン */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-bold
                   transition active:scale-[0.98] shadow-sm
                   hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
            </svg>
            保存中...
          </>
        ) : '日報を保存する →'}
      </button>
    </div>
  )
}

// ────────────────────────────────────────────────
// ReportCard コンポーネント
// ────────────────────────────────────────────────

function ReportCard({ report, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isToday = report.date === todayStr()

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(report.id)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100
                    p-4 border-l-4 border-l-blue-500 hover:shadow-md
                    transition-shadow duration-200">
      {/* ヘッダー行 */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs text-gray-400 font-medium">{formatDate(report.date)}</span>
            {isToday && (
              <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                本日
              </span>
            )}
          </div>
          <p className="text-base font-bold text-gray-800 truncate">{report.company}</p>
          <p className="text-xs text-gray-400 mt-0.5">担当：{report.name}</p>
        </div>
        <button
          onClick={handleDelete}
          className={`ml-2 flex-shrink-0 text-xs px-2.5 py-1.5 rounded-lg
                      border transition font-medium
                      ${confirmDelete
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-gray-400 border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-300'}`}
        >
          {confirmDelete ? '確認' : '削除'}
        </button>
      </div>

      {/* バッジ */}
      <OutcomeBadge outcome={report.outcome} />

      {/* 営業内容 */}
      {report.content && (
        <p className="mt-2.5 text-xs text-gray-600 leading-relaxed
                      line-clamp-3 whitespace-pre-wrap">
          {report.content}
        </p>
      )}

      {/* フォロー予定 */}
      {report.followDate && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-blue-600 font-medium">
          <span>🗓</span>
          次回フォロー：{formatDate(report.followDate)}
        </div>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────
// ReportList コンポーネント
// ────────────────────────────────────────────────

function ReportList({ reports, onDelete }) {
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <span className="text-5xl mb-3">📝</span>
        <p className="text-base font-semibold text-gray-500">日報がまだありません</p>
        <p className="text-sm mt-1">新規作成タブから日報を追加しましょう</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs text-gray-400 mb-3">全 {reports.length} 件（新しい順）</p>
      <div className="flex flex-col gap-3">
        {reports.map(r => (
          <ReportCard key={r.id} report={r} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────
// Statistics コンポーネント
// ────────────────────────────────────────────────

function Statistics({ reports }) {
  const monthPrefix = getThisMonthPrefix()
  const thisMonth = reports.filter(r => r.date.startsWith(monthPrefix))

  // 成果別集計
  const counts = reports.reduce((acc, r) => {
    acc[r.outcome] = (acc[r.outcome] || 0) + 1
    return acc
  }, {})
  const maxCount = Math.max(...Object.values(counts), 1)

  // 近日フォロー予定
  const today = todayStr()
  const upcoming = reports
    .filter(r => r.followDate && r.followDate >= today)
    .sort((a, b) => a.followDate.localeCompare(b.followDate))
    .slice(0, 5)

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <span className="text-5xl mb-3">📊</span>
        <p className="text-base font-semibold text-gray-500">データがありません</p>
        <p className="text-sm mt-1">日報を登録すると統計が表示されます</p>
      </div>
    )
  }

  const statCards = [
    { num: thisMonth.length, label: '今月の件数',  color: 'text-blue-600'  },
    { num: reports.length,   label: '累計件数',    color: 'text-indigo-600' },
    { num: counts['商談成立'] || 0, label: '商談成立数', color: 'text-green-600' },
    { num: upcoming.length,  label: 'フォロー予定', color: 'text-amber-600' },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* サマリーカード 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map(({ num, label, color }) => (
          <div key={label}
               className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
            <p className={`text-3xl font-bold leading-none ${color}`}>{num}</p>
            <p className="text-xs text-gray-400 mt-2">{label}</p>
          </div>
        ))}
      </div>

      {/* 成果別グラフ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-bold text-gray-700 mb-4
                       pb-3 border-b border-gray-100">成果別集計</h2>
        {OUTCOMES.filter(o => counts[o]).map(o => {
          const s = OUTCOME_STYLE[o] || OUTCOME_STYLE['その他']
          const pct = Math.round((counts[o] / maxCount) * 100)
          return (
            <div key={o} className="flex items-center gap-3 mb-3 last:mb-0">
              <span className="text-xs text-gray-600 w-24 flex-shrink-0">{o}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${s.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-bold text-gray-700 w-5 text-right">
                {counts[o]}
              </span>
            </div>
          )
        })}
      </div>

      {/* フォロー予定 */}
      {upcoming.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-4
                         pb-3 border-b border-gray-100">
            🗓 近日フォロー予定
          </h2>
          <div className="flex flex-col gap-3">
            {upcoming.map(r => (
              <div key={r.id}
                   className="flex items-center gap-3 p-3
                              bg-blue-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-blue-600">{formatDate(r.followDate)}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{r.company}</p>
                  <p className="text-xs text-gray-400">{r.name}</p>
                </div>
                <OutcomeBadge outcome={r.outcome} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────
// App（ルートコンポーネント）
// ────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState('form')
  const [reports, setReports] = useState(loadReports)
  const [toast, setToast] = useState(null)

  // LocalStorage へ永続化
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
  }, [reports])

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }, [])

  const addReport = useCallback((form) => {
    const newReport = { ...form, id: Date.now() }
    setReports(prev => [newReport, ...prev])
    showToast('日報を保存しました ✓')
    setTab('list')
  }, [showToast])

  const deleteReport = useCallback((id) => {
    setReports(prev => prev.filter(r => r.id !== id))
    showToast('削除しました')
  }, [showToast])

  const TABS = [
    { key: 'form',  label: '＋ 新規作成' },
    { key: 'list',  label: reports.length > 0 ? `一覧 (${reports.length})` : '一覧' },
    { key: 'stats', label: '統計' },
  ]

  const dateLabel = new Date().toLocaleDateString('ja-JP', {
    month: 'long', day: 'numeric', weekday: 'short',
  })

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* ────── ヘッダー ────── */}
      <header className="bg-blue-600 text-white px-5 py-3.5
                         sticky top-0 z-20 shadow-md shadow-blue-900/20">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div>
            <h1 className="text-lg font-bold tracking-wide leading-tight">営業日報</h1>
            <p className="text-xs text-blue-200 mt-0.5 tracking-wider">Sales Daily Report</p>
          </div>
          <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-medium">
            {dateLabel}
          </span>
        </div>
      </header>

      {/* ────── タブバー ────── */}
      <nav className="bg-white border-b border-gray-200 sticky top-[60px] z-10">
        <div className="flex max-w-lg mx-auto">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-3 text-xs font-semibold transition
                          border-b-2 whitespace-nowrap
                          ${tab === key
                            ? 'text-blue-600 border-blue-600'
                            : 'text-gray-500 border-transparent hover:text-blue-500 hover:bg-blue-50'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* ────── メインコンテンツ ────── */}
      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
        {tab === 'form'  && <ReportForm    onSubmit={addReport} />}
        {tab === 'list'  && <ReportList    reports={reports}    onDelete={deleteReport} />}
        {tab === 'stats' && <Statistics    reports={reports} />}
      </main>

      {/* ────── Toast ────── */}
      {toast && <Toast message={toast} />}
    </div>
  )
}