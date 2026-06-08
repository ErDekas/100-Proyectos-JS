import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, type ChartOptions } from 'chart.js'
import { Line } from 'react-chartjs-2'
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const gridC = isDark ? 'rgba(241,245,249,.07)' : 'rgba(15,23,42,.06)'
const textC = '#94a3b8'
interface Props { labels: string[]; sessions: number[]; revenue: number[] }
export function TrendChart({ labels, sessions, revenue }: Props) {
  const data = { labels, datasets: [
    { label:'Sesiones', data:sessions, borderColor:'#2563eb', backgroundColor:'rgba(37,99,235,.08)', fill:true, tension:.4, pointRadius:0, borderWidth:2, yAxisID:'y' },
    { label:'Ingresos',  data:revenue,  borderColor:'#059669', backgroundColor:'transparent', fill:false, tension:.4, pointRadius:0, borderWidth:2, borderDash:[5,4], yAxisID:'y2' },
  ]}
  const options: ChartOptions<'line'> = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{display:false}, tooltip:{ mode:'index', intersect:false, backgroundColor:isDark?'#1e293b':'#fff', titleColor:textC, bodyColor:isDark?'#f1f5f9':'#0f172a', borderColor:isDark?'rgba(241,245,249,.13)':'rgba(15,23,42,.1)', borderWidth:1, padding:10,
      callbacks:{ label:(ctx)=>{ const y = ctx.parsed.y ?? 0; return ctx.datasetIndex===0?`  Sesiones: ${y.toLocaleString()}`:`  Ingresos: €${y.toLocaleString()}`} }}},
    scales:{
      x:{ grid:{color:gridC}, ticks:{color:textC,font:{size:10},maxTicksLimit:8,maxRotation:0} },
      y:{ grid:{color:gridC}, ticks:{color:textC,font:{size:10},callback:(v)=>Number(v)>=1000?`${(Number(v)/1000).toFixed(0)}k`:v}, position:'left' },
      y2:{ grid:{display:false}, ticks:{color:textC,font:{size:10},callback:(v)=>`€${Number(v)>=1000?(Number(v)/1000).toFixed(1)+'k':v}`}, position:'right' },
    }
  }
  return (
    <div className="card">
      <div style={{display:'flex',alignItems:'center',marginBottom:16}}>
        <span style={{fontSize:13,fontWeight:600,color:'var(--ink)',flex:1,letterSpacing:'-0.2px'}}>Sesiones e ingresos</span>
        <span style={{fontSize:11,color:'var(--ink3)',fontFamily:'DM Mono, monospace'}}>diario</span>
      </div>
      <div style={{height:220,position:'relative'}}><Line data={data} options={options}/></div>
      <div style={{display:'flex',gap:16,marginTop:10,fontSize:11}}>
        <span style={{display:'flex',alignItems:'center',gap:5,color:'var(--ink2)'}}><span style={{width:10,height:10,borderRadius:2,background:'#2563eb',display:'inline-block'}}/>Sesiones</span>
        <span style={{display:'flex',alignItems:'center',gap:5,color:'var(--ink2)'}}><span style={{width:10,height:10,borderRadius:2,border:'2px dashed #059669',display:'inline-block',boxSizing:'border-box'}}/>Ingresos (€)</span>
      </div>
    </div>
  )
}
