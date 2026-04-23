import { OUTCOMES, formatDate } from '../App'

const OUTCOME_COLORS = {
  '商談成立': '#16a34a', '提案': '#2563EB', '情報収集': '#7C3AED',
  'フォローアップ': '#0891B2', 'クレーム対応': '#DC2626', '新規開拓': '#D97706', 'その他': '#94A3B8'
}

export default function Statistics({ reports }) {
  const now = new Date()
  const ymPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const thisMonth = reports.filter(r => r.date.startsWith(ymPrefix))

  const outcomeCounts = reports.reduce((acc, r) => {
    acc[r.outcome] = (acc[r.outcome] || 0) + 1
    return acc
  }, {})

  const maxCount = Math.max(...Object.values(outcomeCounts), 1)

  // 次回フォロー予定（未来の日付のみ）
  const todayStr = new Date().toISOString().split('T')[0]
  const upcoming = reports
    .filter(r => r.followDate && r.followDate >= todayStr)
    .sort((a, b) => a.followDate.localeCompare(b.followDate))
    .slice(0, 3)

  if (reports.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📊</div>
        <p className="empty-title">データがありません</p>
        <p className="empty-sub">日報を登録すると統計が表示されます</p>
      </div>
    )
  }

  return (
    <div>
      {/* サマリーカード */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-num">{thisMonth.length}</div>
          <div className="stat-label">今月の件数</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{reports.length}</div>
          <div className="stat-label">累計件数</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: '#16a34a' }}>
            {outcomeCounts['商談成立'] || 0}
          </div>
          <div className="stat-label">商談成立</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: '#D97706' }}>
            {upcoming.length}
          </div>
          <div className="stat-label">フォロー予定</div>
        </div>
      </div>

      {/* 成果別グラフ */}
      <div className="card">
        <h2 className="section-title">成果別集計</h2>
        {OUTCOMES.filter(o => outcomeCounts[o]).map(o => (
          <div key={o} className="stat-row">
            <div className="stat-name">{o}</div>
            <div className="stat-track">
              <div
                className="stat-fill"
                style={{
                  width: `${(outcomeCounts[o] || 0) / maxCount * 100}%`,
                  background: OUTCOME_COLORS[o] || '#94A3B8'
                }}
              />
            </div>
            <div className="stat-count">{outcomeCounts[o] || 0}</div>
          </div>
        ))}
      </div>

      {/* フォロー予定 */}
      {upcoming.length > 0 && (
        <div className="card">
          <h2 className="section-title">📅 近日フォロー予定</h2>
          {upcoming.map(r => (
            <div key={r.id} className="follow-item">
              <div className="follow-date">{formatDate(r.followDate)}</div>
              <div className="follow-company">{r.company}</div>
              <div className="follow-person">{r.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
