import { useState } from 'react'
import { OUTCOMES, today } from '../App'

const initialForm = {
  date: today(),
  name: '',
  company: '',
  content: '',
  outcome: '提案',
  followDate: '',
}

export default function ReportForm({ onSubmit }) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = '担当者名を入力してください'
    if (!form.company.trim()) e.company = '訪問先企業を入力してください'
    if (!form.content.trim()) e.content = '営業内容を入力してください'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    onSubmit(form)
    setForm({ ...initialForm, date: today(), name: form.name })
    setErrors({})
    setLoading(false)
  }

  return (
    <div className="card fade-in">
      <h2 className="section-title">日報を記録する</h2>

      <div className="field">
        <label className="label">日付</label>
        <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
      </div>

      <div className="field">
        <label className="label">営業担当者名 <span className="required">*</span></label>
        <input className="input" placeholder="山田 太郎" value={form.name}
          onChange={e => set('name', e.target.value)} />
        {errors.name && <p className="error-msg">{errors.name}</p>}
      </div>

      <div className="field">
        <label className="label">訪問先企業 <span className="required">*</span></label>
        <input className="input" placeholder="株式会社〇〇" value={form.company}
          onChange={e => set('company', e.target.value)} />
        {errors.company && <p className="error-msg">{errors.company}</p>}
      </div>

      <div className="field">
        <label className="label">営業内容 <span className="required">*</span></label>
        <textarea className="textarea" placeholder="今日の営業活動の詳細を記入してください..."
          value={form.content} onChange={e => set('content', e.target.value)} />
        {errors.content && <p className="error-msg">{errors.content}</p>}
      </div>

      <div className="field">
        <label className="label">成果</label>
        <select className="select" value={form.outcome} onChange={e => set('outcome', e.target.value)}>
          {OUTCOMES.map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      <div className="field">
        <label className="label">次回フォロー予定日</label>
        <input className="input" type="date" value={form.followDate}
          min={today()} onChange={e => set('followDate', e.target.value)} />
      </div>

      <button className="btn btn-primary" onClick={submit} disabled={loading}>
        {loading ? (
          <span className="loading-text"><span className="spinner" />保存中...</span>
        ) : '日報を保存する →'}
      </button>
    </div>
  )
}
