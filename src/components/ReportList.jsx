import { formatDate, today } from '../App'

const OUTCOME_COLORS = {
  '商談成立': { bg: '#DCFCE7', color: '#166534', border: '#16a34a' },
  '提案':     { bg: '#DBEAFE', color: '#1E40AF', border: '#2563EB' },
  '情報収集': { bg: '#F3E8FF', color: '#6B21A8', border: '#7C3AED' },
  'フォローアップ': { bg: '#E0F2FE', color: '#075985', border: '#0891B2' },
  'クレーム対応':  { bg: '#FEE2E2', color: '#991B1B', border: '#DC2626' },
  '新規開拓': { bg: '#FEF3C7', color: '#92400E', border: '#D97706' },
  'その他':   { bg: '#F1F5F9', color: '#475569', border: '#94A3B8' },
}

function OutcomeBadge({ outcome }) {
  const c = OUTCOME_COLORS[outcome] || OUTCOME_COLORS['その他']
  return (
    <span className="badge" style={{ background: c.bg, color: c.color, borderColor: c.border }}>
      {outcome}
    </span>
  )
}

function ReportCard({ report, onDelete }) {
  const isToday = report.date === today()
  return (
    <div className="report-card fade-in">
      <div className="report-header">
        <div className="report-meta">
          <div className="report-date-line">
            <span className="report-date">{formatDate(report.date)}</span>
            {isToday && <span className="today-badge">本日</span>}
          </div>
          <div className="report-company">{report.company}</div>
          <div className="report-person">担当：{report.name}</div>
        </div>
        <button className="btn-delete" onClick={() => onDelete(report.id)} aria-label="削除">
          ✕
        </button>
      </div>

      <OutcomeBadge outcome={report.outcome} />

      {report.content && (
        <p className="report-content">{report.content}</p>
      )}

      {report.followDate && (
        <div className="report-follow">
          <span className="follow-icon">🗓</span>
          次回フォロー：{formatDate(report.followDate)}
        </div>
      )}
    </div>
  )
}

export default function ReportList({ reports, onDelete }) {
  if (reports.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📝</div>
        <p className="empty-title">日報がまだありません</p>
        <p className="empty-sub">新規作成タブから日報を追加しましょう</p>
      </div>
    )
  }

  return (
    <div>
      <p className="list-count">全 {reports.length} 件</p>
      {reports.map(r => (
        <ReportCard key={r.id} report={r} onDelete={onDelete} />
      ))}
    </div>
  )
}
