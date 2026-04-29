import type { Campaign } from '@analytiq/shared'
import { clsx } from 'clsx'
const STATUS_LABELS = { active:'Activa', pending:'Pendiente', paused:'Pausada' }
const STATUS_CLASS  = { active:'status-active', pending:'status-pending', paused:'status-paused' }
export function CampaignsTable({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <div className="card" style={{gridColumn:'span 2'}}>
      <div style={{display:'flex',alignItems:'center',marginBottom:16}}>
        <span style={{fontSize:13,fontWeight:600,color:'var(--ink)',flex:1,letterSpacing:'-0.2px'}}>Campañas</span>
        <span style={{fontSize:11,color:'var(--ink3)',fontFamily:'DM Mono, monospace'}}>por ingresos</span>
      </div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
          <thead><tr>{['Campaña','Canal','Sesiones','Conv.','Ingresos','Estado'].map(h=>(
            <th key={h} style={{fontSize:10,fontWeight:500,color:'var(--ink3)',letterSpacing:'.6px',textTransform:'uppercase',fontFamily:'DM Mono, monospace',padding:'0 12px 10px',textAlign:'left',borderBottom:'0.5px solid var(--border2)'}}>{h}</th>
          ))}</tr></thead>
          <tbody>{campaigns.map((c,i)=>(
            <tr key={c.id} style={{borderBottom:i<campaigns.length-1?'0.5px solid var(--border)':'none'}}>
              <td style={{padding:'10px 12px',color:'var(--ink)',fontWeight:500}}>{c.name}</td>
              <td style={{padding:'10px 12px',color:'var(--ink3)',fontFamily:'DM Mono, monospace'}}>{c.channel}</td>
              <td style={{padding:'10px 12px',color:'var(--ink2)',fontFamily:'DM Mono, monospace'}}>{c.sessions.toLocaleString()}</td>
              <td style={{padding:'10px 12px',color:'var(--ink2)',fontFamily:'DM Mono, monospace'}}>{c.convRate}%</td>
              <td style={{padding:'10px 12px',fontFamily:'DM Mono, monospace',fontWeight:500,color:c.status==='paused'?'var(--ink3)':c.status==='pending'?'var(--amber)':'var(--green)'}}>€{c.revenue.toLocaleString()}</td>
              <td style={{padding:'10px 12px'}}><span className={clsx('status-pill',STATUS_CLASS[c.status])}>{STATUS_LABELS[c.status]}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}
