import type { FunnelStep, FeedItem } from '@analytiq/shared'
const FEED_ICONS: Record<string,{icon:string;bg:string}> = {
  up:{icon:'↑',bg:'var(--green-l)'}, email:{icon:'✉',bg:'var(--blue-l)'},
  warn:{icon:'!',bg:'var(--amber-l)'}, money:{icon:'€',bg:'var(--green-l)'}
}
export function FunnelCard({ steps }: { steps: FunnelStep[] }) {
  const max = steps[0]?.count || 1
  return (
    <div className="card">
      <div style={{fontSize:13,fontWeight:600,color:'var(--ink)',marginBottom:16,letterSpacing:'-0.2px'}}>Embudo de conversión</div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {steps.map(step=>{
          const pct = Math.round((step.count/max)*100)
          return (
            <div key={step.label} style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:11,color:'var(--ink2)',fontFamily:'DM Mono, monospace',width:80,flexShrink:0}}>{step.label}</span>
              <div style={{flex:1,height:20,background:'var(--surf3)',borderRadius:4,overflow:'hidden'}}>
                <div style={{width:`${pct}%`,height:'100%',background:step.color,borderRadius:4,display:'flex',alignItems:'center',justifyContent:'flex-end',paddingRight:8,fontSize:10,fontWeight:500,fontFamily:'DM Mono, monospace',color:'#fff',transition:'width .6s ease'}}>
                  {pct>12?`${(step.count/1000).toFixed(1)}k`:''}
                </div>
              </div>
              <span style={{fontSize:11,fontFamily:'DM Mono, monospace',color:'var(--ink3)',width:52,textAlign:'right',flexShrink:0}}>{step.count.toLocaleString()}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export function ActivityFeed({ items }: { items: FeedItem[] }) {
  return (
    <div className="card">
      <div style={{fontSize:13,fontWeight:600,color:'var(--ink)',marginBottom:12,letterSpacing:'-0.2px'}}>Actividad reciente</div>
      <div>{items.map((item,i)=>{
        const {icon,bg}=FEED_ICONS[item.type]??{icon:'·',bg:'var(--surf3)'}
        return (
          <div key={item.id} style={{display:'flex',alignItems:'flex-start',gap:11,padding:'10px 0',borderBottom:i<items.length-1?'0.5px solid var(--border)':'none'}}>
            <div style={{width:28,height:28,borderRadius:'50%',background:bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:13}}>{icon}</div>
            <div>
              <div style={{fontSize:12,fontWeight:500,color:'var(--ink)'}}>{item.title}</div>
              <div style={{fontSize:11,color:'var(--ink3)',fontFamily:'DM Mono, monospace',marginTop:1}}>{item.meta}</div>
            </div>
          </div>
        )
      })}</div>
    </div>
  )
}
