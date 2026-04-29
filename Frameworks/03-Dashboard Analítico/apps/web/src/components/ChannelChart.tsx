import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import type { ChannelShare } from '@analytiq/shared'
ChartJS.register(ArcElement, Tooltip)
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
export function ChannelChart({ channels }: { channels: ChannelShare[] }) {
  const total = channels.reduce((s,c)=>s+c.sessions,0)
  const data = { labels:channels.map(c=>c.name), datasets:[{ data:channels.map(c=>c.pct), backgroundColor:channels.map(c=>c.color), borderWidth:0, hoverOffset:4 }] }
  return (
    <div className="card">
      <div style={{display:'flex',alignItems:'center',marginBottom:16}}>
        <span style={{fontSize:13,fontWeight:600,color:'var(--ink)',flex:1,letterSpacing:'-0.2px'}}>Canales de adquisición</span>
        <span style={{fontSize:11,color:'var(--ink3)',fontFamily:'DM Mono, monospace'}}>este período</span>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:16}}>
        <div style={{height:160,position:'relative'}}>
          <Doughnut data={data} options={{ responsive:true, maintainAspectRatio:false, cutout:'72%', plugins:{ legend:{display:false}, tooltip:{ backgroundColor:isDark?'#1e293b':'#fff', titleColor:'#94a3b8', bodyColor:isDark?'#f1f5f9':'#0f172a', borderColor:isDark?'rgba(241,245,249,.13)':'rgba(15,23,42,.1)', borderWidth:1, callbacks:{label:(ctx)=>`${ctx.label}: ${ctx.parsed}%`} }} }}/>
          <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',textAlign:'center'}}>
            <div style={{fontSize:18,fontWeight:600,fontFamily:'DM Mono, monospace',color:'var(--ink)',lineHeight:1}}>{(total/1000).toFixed(1)}k</div>
            <div style={{fontSize:10,color:'var(--ink3)',fontFamily:'DM Mono, monospace',marginTop:2}}>sesiones</div>
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {channels.map(ch=>(
            <div key={ch.name} style={{display:'flex',alignItems:'center',gap:8,fontSize:12}}>
              <div style={{width:8,height:8,borderRadius:2,background:ch.color,flexShrink:0}}/>
              <span style={{color:'var(--ink2)',flex:1}}>{ch.name}</span>
              <div style={{flex:1,height:3,background:'var(--surf3)',borderRadius:2,overflow:'hidden'}}>
                <div style={{width:`${ch.pct}%`,height:'100%',background:ch.color,borderRadius:2}}/>
              </div>
              <span style={{fontFamily:'DM Mono, monospace',fontWeight:500,color:'var(--ink)',width:28,textAlign:'right'}}>{ch.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
