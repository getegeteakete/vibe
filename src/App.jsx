import { useState, useEffect, useRef, useCallback } from "react";

// ─── localStorage polyfill for window.storage ───────────────
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    get: async (key) => {
      const val = localStorage.getItem(key);
      return val ? { key, value: val } : null;
    },
    set: async (key, value) => {
      localStorage.setItem(key, value);
      return { key, value };
    },
    delete: async (key) => {
      localStorage.removeItem(key);
      return { key, deleted: true };
    },
    list: async (prefix = "") => {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
      return { keys };
    },
  };
}

// ─── PALETTE ────────────────────────────────────────────────
const T = {
  bg:      "#070F1C",
  card:    "#0D1B2A",
  card2:   "#111E2E",
  border:  "#1A2E42",
  teal:    "#00C9A7",
  cyan:    "#0EA5E9",
  purple:  "#8B5CF6",
  orange:  "#F97316",
  pink:    "#EC4899",
  gold:    "#F59E0B",
  white:   "#F0F9FF",
  gray:    "#64748B",
  lgray:   "#94A3B8",
};

// ─── MOCK DATA ───────────────────────────────────────────────
const CATEGORIES = [
  { id:"ec",    name:"ECサイト",        icon:"🛒", count:42, color:T.teal   },
  { id:"lp",    name:"ランディングページ", icon:"🚀", count:68, color:T.cyan   },
  { id:"booking",name:"予約・サロン",    icon:"📅", count:29, color:T.purple },
  { id:"portfolio",name:"ポートフォリオ", icon:"🎨", count:55, color:T.orange },
  { id:"blog",  name:"ブログ・メディア",  icon:"📝", count:37, color:T.pink   },
  { id:"biz",   name:"コーポレート",     icon:"🏢", count:61, color:T.gold   },
  { id:"saas",  name:"SaaS・ツール",     icon:"⚙️", count:24, color:"#34D399" },
  { id:"event", name:"イベント",         icon:"🎉", count:18, color:"#F472B6" },
];

const SITES = [
  { id:1, title:"Ultra Commerce Pro",  cat:"ec",      price:4800,  monthly:null, desc:"決済・在庫・SEO完備の本格ECサイト。スマホ対応済み。", seller:"TechDesign JP", rating:4.9, sales:234, badge:"人気No.1", color:"#00C9A7", preview:"🛒" },
  { id:2, title:"ConvertFlow LP",      cat:"lp",      price:2800,  monthly:null, desc:"高転換率LPテンプレ。A/Bテスト機能付き。", seller:"GrowthHacker",  rating:4.7, sales:189, badge:"新着",    color:"#0EA5E9", preview:"🚀" },
  { id:3, title:"Salon Booking Suite", cat:"booking", price:6500,  monthly:null, desc:"予約・顧客管理・LINE連携対応のサロン特化サイト。", seller:"BeautyTech",    rating:4.8, sales:97,  badge:"人気",    color:"#8B5CF6", preview:"📅" },
  { id:4, title:"Minimal Portfolio",   cat:"portfolio",price:1800, monthly:null, desc:"写真・動画ギャラリー機能付き。デザイナー向け。", seller:"PixelCraft",    rating:4.6, sales:312, badge:null,      color:"#F97316", preview:"🎨" },
  { id:5, title:"TechBlog Pro",        cat:"blog",    price:2200,  monthly:null, desc:"SEO最適化済みブログ。ダーク/ライトモード対応。", seller:"ContentPro",    rating:4.5, sales:156, badge:null,      color:"#EC4899", preview:"📝" },
  { id:6, title:"Corporate Premium",   cat:"biz",     price:9800,  monthly:null, desc:"採用・IR・多言語対応のエンタープライズ向けコーポレートサイト。", seller:"BizFactory",    rating:5.0, sales:78,  badge:"プレミアム",color:"#F59E0B", preview:"🏢" },
  { id:7, title:"SaaS Dashboard Kit",  cat:"saas",    price:12000, monthly:980,  desc:"ユーザー管理・課金・分析を備えたSaaS基盤。APIドキュメント付き。", seller:"DevForge",      rating:4.9, sales:45,  badge:"新着",    color:"#34D399", preview:"⚙️" },
  { id:8, title:"Event Flow",          cat:"event",   price:3200,  monthly:null, desc:"チケット販売・QRコード入場管理・配信対応のイベントサイト。", seller:"EventLab",      rating:4.4, sales:203, badge:null,      color:"#F472B6", preview:"🎉" },
  { id:9, title:"FoodDelivery UI",     cat:"ec",      price:5500,  monthly:null, desc:"フードデリバリー専用EC。GPSトラッキング、注文管理付き。", seller:"FoodTech",      rating:4.7, sales:134, badge:"人気",    color:"#00C9A7", preview:"🍔" },
  { id:10,title:"Agency Portfolio",    cat:"portfolio",price:3800, monthly:null, desc:"制作会社向け。実績・チーム紹介・お問い合わせフォーム完備。", seller:"AgencyKit",     rating:4.6, sales:88,  badge:null,      color:"#F97316", preview:"💼" },
  { id:11,title:"AI Landing Generator",cat:"lp",      price:7200,  monthly:480,  desc:"ChatGPTでコンテンツ自動生成するLPビルダー。", seller:"AIFactory",     rating:4.8, sales:67,  badge:"話題",    color:"#0EA5E9", preview:"🤖" },
  { id:12,title:"Membership Platform", cat:"saas",    price:15000, monthly:1200, desc:"会員制コミュニティ + コース販売 + 決済の3点セット。", seller:"CommKit",       rating:4.9, sales:39,  badge:"プレミアム",color:"#34D399", preview:"👥" },
];

const PLANS = [
  { id:"starter", name:"スターター",  price:3000,  desc:"個人・副業向け",      sites:3,  ai:50,  storage:"5GB",  features:["3サイト利用","AIチャット修正50回/月","テンプレート全公開","コミュニティ参加"] },
  { id:"pro",     name:"プロ",        price:8000,  desc:"フリーランス・制作会社", sites:15, ai:300, storage:"30GB", features:["15サイト利用","AIチャット修正300回/月","優先サポート","マーケット出品可","収益分析ダッシュボード"] },
  { id:"business",name:"ビジネス",    price:15000, desc:"チーム・エンタープライズ",sites:-1, ai:-1,  storage:"無制限",features:["無制限サイト","AI修正無制限","専任サポート","APIアクセス","カスタムドメイン無制限","請求書払い対応"] },
];

// ─── HELPERS ────────────────────────────────────────────────
const fmt = n => `¥${n.toLocaleString()}`;
const stars = r => "★".repeat(Math.floor(r)) + (r%1>=0.5?"½":"") ;

// ─── STYLE HELPERS ──────────────────────────────────────────
const css = {
  card:    { background:T.card,    border:`1px solid ${T.border}`, borderRadius:12 },
  card2:   { background:T.card2,   border:`1px solid ${T.border}`, borderRadius:8  },
  tealBtn: { background:T.teal,    color:T.bg, fontWeight:700, border:'none', borderRadius:8,  cursor:'pointer', transition:'all 0.2s' },
  ghostBtn:{ background:'transparent', color:T.teal, border:`1px solid ${T.teal}`, borderRadius:8, cursor:'pointer', transition:'all 0.2s' },
};

// ─── GLOBAL STYLES ──────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:${T.bg};color:${T.white};font-family:'DM Sans',sans-serif;min-height:100vh;}
    ::-webkit-scrollbar{width:6px;height:6px;}
    ::-webkit-scrollbar-track{background:${T.bg};}
    ::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px;}
    ::-webkit-scrollbar-thumb:hover{background:${T.gray};}
    .syne{font-family:'Syne',sans-serif;}
    .teal{color:${T.teal};}
    .fade-in{animation:fadeIn 0.4s ease forwards;}
    @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    .slide-in{animation:slideIn 0.3s ease forwards;}
    @keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
    .glow{box-shadow:0 0 20px ${T.teal}33;}
    .hover-card:hover{border-color:${T.teal}55!important;transform:translateY(-2px);transition:all 0.2s;}
    .btn-teal:hover{background:#00e5bf!important;transform:translateY(-1px);box-shadow:0 4px 15px ${T.teal}44;}
    .btn-ghost:hover{background:${T.teal}18!important;}
    .nav-link:hover{color:${T.teal}!important;}
    .cat-card:hover{border-color:var(--cat-color)!important;background:var(--cat-color)11!important;}
    .tag{display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;}
    .badge-new{background:${T.cyan}22;color:${T.cyan};}
    .badge-hot{background:${T.orange}22;color:${T.orange};}
    .badge-prem{background:${T.gold}22;color:${T.gold};}
    .badge-pop{background:${T.teal}22;color:${T.teal};}
    .input{background:${T.card2};border:1px solid ${T.border};color:${T.white};border-radius:8px;padding:10px 14px;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:border 0.2s;}
    .input:focus{border-color:${T.teal};}
    .input::placeholder{color:${T.gray};}
    .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;}
    .chat-bubble-user{background:${T.teal}22;border:1px solid ${T.teal}44;border-radius:18px 18px 4px 18px;padding:12px 16px;max-width:80%;align-self:flex-end;}
    .chat-bubble-ai{background:${T.card2};border:1px solid ${T.border};border-radius:18px 18px 18px 4px;padding:12px 16px;max-width:85%;align-self:flex-start;}
    .pulse{animation:pulse 2s infinite;}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
    .shimmer{background:linear-gradient(90deg,${T.card} 25%,${T.card2} 50%,${T.card} 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;}
    @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    .progress-bar{height:4px;background:${T.border};border-radius:2px;overflow:hidden;}
    .progress-fill{height:100%;background:linear-gradient(90deg,${T.teal},${T.cyan});border-radius:2px;transition:width 0.3s;}
    a{color:inherit;text-decoration:none;}
    select{appearance:none;}
    textarea{resize:vertical;}
  `}</style>
);

// ─── NAV ────────────────────────────────────────────────────
function Nav({ page, setPage, user, setShowAuth, cart, setCart }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [
    { id:"home",      label:"ホーム" },
    { id:"market",    label:"マーケット" },
    { id:"pricing",   label:"料金プラン" },
  ];
  return (
    <nav style={{background:`${T.bg}ee`,backdropFilter:"blur(12px)",borderBottom:`1px solid ${T.border}`,position:"sticky",top:0,zIndex:100,padding:"0 24px"}}>
      <div style={{maxWidth:1280,margin:"0 auto",height:60,display:"flex",alignItems:"center",gap:24}}>
        {/* Logo */}
        <div onClick={()=>setPage("home")} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <div style={{width:32,height:32,background:`linear-gradient(135deg,${T.teal},${T.cyan})`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>⚡</div>
          <span className="syne" style={{fontWeight:800,fontSize:18,color:T.white}}>Vibe<span style={{color:T.teal}}>Code</span></span>
        </div>

        {/* Nav links */}
        <div style={{display:"flex",gap:4,flex:1}}>
          {navItems.map(n=>(
            <button key={n.id} className="nav-link" onClick={()=>setPage(n.id)}
              style={{background:"none",border:"none",cursor:"pointer",padding:"6px 12px",borderRadius:6,
                color: page===n.id ? T.teal : T.lgray,
                fontWeight: page===n.id ? 600 : 400,
                fontSize:14,transition:"color 0.2s",fontFamily:"'DM Sans',sans-serif"}}>
              {n.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{flex:1,maxWidth:300,position:"relative"}}>
          <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:T.gray,fontSize:14}}>🔍</span>
          <input className="input" placeholder="サイトを検索..." style={{width:"100%",paddingLeft:32,fontSize:13}} />
        </div>

        {/* Right */}
        <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
          {user ? (
            <>
              <button onClick={()=>setPage("upload")} className="btn-ghost"
                style={{...css.ghostBtn,padding:"6px 14px",fontSize:13}}>出品する</button>
              <button onClick={()=>setPage("dashboard")} style={{display:"flex",alignItems:"center",gap:8,background:T.card2,border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 12px",cursor:"pointer",color:T.white,fontSize:13}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:`linear-gradient(135deg,${T.teal},${T.cyan})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700}}>
                  {user.name[0]}
                </div>
                <span>{user.name}</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={()=>setShowAuth("login")} className="btn-ghost"
                style={{...css.ghostBtn,padding:"6px 16px",fontSize:13}}>ログイン</button>
              <button onClick={()=>setShowAuth("register")} className="btn-teal"
                style={{...css.tealBtn,padding:"6px 16px",fontSize:13}}>無料登録</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─── HOME PAGE ──────────────────────────────────────────────
function HomePage({ setPage, setSelectedSite, user, setShowAuth }) {
  const [activeCat, setActiveCat] = useState(null);
  const filtered = activeCat ? SITES.filter(s=>s.cat===activeCat) : SITES;
  const featured = SITES.filter(s=>s.badge==="人気No.1" || s.badge==="プレミアム" || s.badge==="話題").slice(0,3);

  return (
    <div style={{maxWidth:1280,margin:"0 auto",padding:"24px"}}>

      {/* HERO */}
      <div className="fade-in" style={{borderRadius:16,padding:"56px 48px",marginBottom:32,position:"relative",overflow:"hidden",
        background:`linear-gradient(135deg,#071322 0%,#0D2137 60%,#071322 100%)`,
        border:`1px solid ${T.border}`}}>
        {/* BG effects */}
        <div style={{position:"absolute",top:-60,right:-60,width:400,height:400,borderRadius:"50%",background:`${T.teal}08`,pointerEvents:"none"}} />
        <div style={{position:"absolute",bottom:-80,right:100,width:250,height:250,borderRadius:"50%",background:`${T.cyan}06`,pointerEvents:"none"}} />
        <div style={{position:"absolute",top:20,right:80,opacity:0.06,fontSize:180,pointerEvents:"none",userSelect:"none"}}>⚡</div>

        <div style={{position:"relative",maxWidth:640}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${T.teal}18`,border:`1px solid ${T.teal}33`,borderRadius:20,padding:"4px 14px",fontSize:12,color:T.teal,marginBottom:20,fontWeight:600}}>
            🇯🇵 日本初・バイブコーディングマーケット
          </div>
          <h1 className="syne" style={{fontSize:48,fontWeight:800,lineHeight:1.1,marginBottom:16}}>
            ゼロから<span style={{color:T.teal}}>AIでサイト</span>を<br/>作って、売って、稼ぐ。
          </h1>
          <p style={{fontSize:16,color:T.lgray,marginBottom:32,lineHeight:1.7}}>
            初期費用ゼロ・3ヶ月分のサブスクで即スタート。<br/>
            AIチャットでサイトを修正し、マーケットで売買できる唯一のプラットフォーム。
          </p>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <button onClick={()=>user ? setPage("market") : setShowAuth("register")} className="btn-teal"
              style={{...css.tealBtn,padding:"14px 28px",fontSize:15,borderRadius:10,display:"flex",alignItems:"center",gap:8}}>
              ⚡ 今すぐ無料登録
            </button>
            <button onClick={()=>setPage("market")} className="btn-ghost"
              style={{...css.ghostBtn,padding:"14px 28px",fontSize:15,borderRadius:10}}>
              サイトを見る →
            </button>
          </div>
          <div style={{display:"flex",gap:24,marginTop:28,flexWrap:"wrap"}}>
            {[["1,200+","登録サイト数"],["4,800+","アクティブ会員"],["¥0","初期費用"],["5分","で利用開始"]].map(([v,l])=>(
              <div key={l}>
                <div className="syne" style={{fontSize:22,fontWeight:800,color:T.teal}}>{v}</div>
                <div style={{fontSize:12,color:T.gray}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{marginBottom:40}}>
        <h2 className="syne" style={{fontSize:22,fontWeight:700,marginBottom:20}}>
          <span style={{color:T.teal}}>3ステップ</span>で今日からスタート
        </h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
          {[
            { n:"01", icon:"💳", title:"サブスク購入", desc:"PayPal等で3ヶ月分の利用料を支払い。初期費用ゼロで即日アクティベート。", color:T.teal },
            { n:"02", icon:"🤖", title:"AIに指示するだけ", desc:"「ヘッダーの色を変えて」「商品ページを追加して」チャットで指示するとAIが自動修正。", color:T.cyan },
            { n:"03", icon:"🛒", title:"マーケットで売買", desc:"完成したサイトをマーケットに出品。他ユーザーのサイトも購入して即使える。", color:T.purple },
          ].map(s=>(
            <div key={s.n} style={{...css.card,padding:24,position:"relative",overflow:"hidden"}} className="hover-card">
              <div style={{position:"absolute",top:-10,right:-10,fontSize:60,opacity:0.05}}>{s.icon}</div>
              <div style={{fontSize:11,fontWeight:700,color:s.color,marginBottom:8,fontFamily:"'Syne',sans-serif"}}>{s.n}</div>
              <div style={{fontSize:28,marginBottom:12}}>{s.icon}</div>
              <div className="syne" style={{fontSize:16,fontWeight:700,marginBottom:8}}>{s.title}</div>
              <p style={{fontSize:13,color:T.lgray,lineHeight:1.6}}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <div style={{marginBottom:40}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <h2 className="syne" style={{fontSize:22,fontWeight:700}}>カテゴリから探す</h2>
          <button onClick={()=>{setActiveCat(null);setPage("market")}} style={{background:"none",border:"none",color:T.teal,cursor:"pointer",fontSize:14}}>すべて見る →</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          {CATEGORIES.map(c=>(
            <div key={c.id} className="cat-card hover-card" onClick={()=>setPage("market")}
              style={{"--cat-color":c.color,...css.card,padding:"16px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:28}}>{c.icon}</div>
              <div>
                <div style={{fontSize:14,fontWeight:600}}>{c.name}</div>
                <div style={{fontSize:12,color:T.gray}}>{c.count}サイト</div>
              </div>
              <div style={{marginLeft:"auto",width:8,height:8,borderRadius:"50%",background:c.color,flexShrink:0}} />
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED */}
      <div style={{marginBottom:40}}>
        <h2 className="syne" style={{fontSize:22,fontWeight:700,marginBottom:20}}>注目のサイト</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
          {featured.map(s=>(
            <SiteCard key={s.id} site={s} onSelect={()=>{setSelectedSite(s);setPage("siteDetail");}} />
          ))}
        </div>
      </div>

      {/* AI FEATURE BANNER */}
      <div style={{borderRadius:16,padding:"36px 40px",marginBottom:32,
        background:`linear-gradient(135deg,#071322 0%,#0A2218 100%)`,
        border:`1px solid ${T.teal}33`,display:"flex",alignItems:"center",gap:40,flexWrap:"wrap"}}>
        <div style={{fontSize:60}}>🤖</div>
        <div style={{flex:1,minWidth:240}}>
          <h3 className="syne" style={{fontSize:24,fontWeight:700,marginBottom:8}}>
            <span style={{color:T.teal}}>AIチャット</span>でサイトを修正
          </h3>
          <p style={{color:T.lgray,lineHeight:1.7,fontSize:14,marginBottom:16}}>
            管理画面の情報をAIに共有するだけ。あとは日本語で話しかければ、<br/>
            ヘッダー変更・商品追加・デザイン調整を自動で実行します。
          </p>
          <button onClick={()=>setPage("aichat")} className="btn-teal"
            style={{...css.tealBtn,padding:"10px 24px",fontSize:14,borderRadius:8}}>
            AIチャットを試す →
          </button>
        </div>
      </div>

      {/* CTA */}
      <div style={{textAlign:"center",padding:"48px 24px",borderRadius:16,
        background:`linear-gradient(135deg,${T.teal}12,${T.cyan}08)`,
        border:`1px solid ${T.teal}22`,marginBottom:24}}>
        <h2 className="syne" style={{fontSize:30,fontWeight:800,marginBottom:12}}>今すぐ始めよう</h2>
        <p style={{color:T.lgray,marginBottom:28,fontSize:15}}>初期費用ゼロ・3ヶ月分のサブスクで全機能が使えます</p>
        <button onClick={()=>setPage("pricing")} className="btn-teal"
          style={{...css.tealBtn,padding:"14px 40px",fontSize:16,borderRadius:10}}>
          料金プランを見る
        </button>
      </div>
    </div>
  );
}

// ─── SITE CARD ──────────────────────────────────────────────
function SiteCard({ site, onSelect, compact }) {
  const badgeClass = site.badge==="新着"?"badge-new":site.badge==="人気No.1"||site.badge==="人気"?"badge-pop":site.badge==="プレミアム"?"badge-prem":"badge-hot";
  return (
    <div className="hover-card" onClick={onSelect}
      style={{...css.card,cursor:"pointer",overflow:"hidden",display:"flex",flexDirection:"column"}}>
      {/* Preview area */}
      <div style={{height:compact?100:140,background:`linear-gradient(135deg,${site.color}22,${site.color}08)`,
        display:"flex",alignItems:"center",justifyContent:"center",position:"relative",
        borderBottom:`1px solid ${T.border}`}}>
        <span style={{fontSize:compact?44:56}}>{site.preview}</span>
        {site.badge && (
          <span className={`tag ${badgeClass}`} style={{position:"absolute",top:10,left:10}}>{site.badge}</span>
        )}
        {site.monthly && (
          <span className="tag badge-prem" style={{position:"absolute",top:10,right:10}}>月額あり</span>
        )}
      </div>
      {/* Info */}
      <div style={{padding:compact?14:18,flex:1,display:"flex",flexDirection:"column",gap:6}}>
        <div className="syne" style={{fontSize:compact?13:15,fontWeight:700,lineHeight:1.3}}>{site.title}</div>
        <p style={{fontSize:12,color:T.lgray,lineHeight:1.5,flex:1}}>{site.desc}</p>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8}}>
          <div>
            <span style={{fontSize:compact?16:18,fontWeight:700,color:T.teal}}>{fmt(site.price)}</span>
            {site.monthly && <span style={{fontSize:11,color:T.gray}}> + {fmt(site.monthly)}/月</span>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4,fontSize:12,color:T.gold}}>
            ★ <span>{site.rating}</span>
            <span style={{color:T.gray}}>({site.sales})</span>
          </div>
        </div>
        <div style={{fontSize:11,color:T.gray}}>出品者: {site.seller}</div>
      </div>
    </div>
  );
}

// ─── MARKET PAGE ────────────────────────────────────────────
function MarketPage({ setSelectedSite, setPage }) {
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("popular");
  const [search, setSearch] = useState("");

  let sites = cat==="all" ? SITES : SITES.filter(s=>s.cat===cat);
  if(search) sites = sites.filter(s=>s.title.toLowerCase().includes(search.toLowerCase())||s.desc.includes(search));
  if(sort==="popular") sites = [...sites].sort((a,b)=>b.sales-a.sales);
  if(sort==="new") sites = [...sites].sort((a,b)=>b.id-a.id);
  if(sort==="price_asc") sites = [...sites].sort((a,b)=>a.price-b.price);
  if(sort==="price_desc") sites = [...sites].sort((a,b)=>b.price-a.price);
  if(sort==="rating") sites = [...sites].sort((a,b)=>b.rating-a.rating);

  return (
    <div style={{maxWidth:1280,margin:"0 auto",padding:"24px"}}>
      <h1 className="syne" style={{fontSize:28,fontWeight:800,marginBottom:8}}>マーケット</h1>
      <p style={{color:T.lgray,marginBottom:24,fontSize:14}}>全{SITES.length}サイト掲載中 — バイブコーディングで作られた本格サイトをそのまま利用</p>

      {/* Filter bar */}
      <div style={{display:"flex",gap:12,marginBottom:24,alignItems:"center",flexWrap:"wrap"}}>
        <input className="input" placeholder="🔍 サイト名・キーワードで検索..."
          value={search} onChange={e=>setSearch(e.target.value)}
          style={{flex:1,minWidth:200}} />
        <select className="input" value={sort} onChange={e=>setSort(e.target.value)}
          style={{minWidth:160,background:T.card2,color:T.white}}>
          <option value="popular">人気順</option>
          <option value="new">新着順</option>
          <option value="price_asc">価格が安い順</option>
          <option value="price_desc">価格が高い順</option>
          <option value="rating">評価順</option>
        </select>
      </div>

      <div style={{display:"flex",gap:24}}>
        {/* Sidebar */}
        <div style={{width:200,flexShrink:0}}>
          <div className="syne" style={{fontSize:12,fontWeight:700,color:T.gray,marginBottom:12,letterSpacing:"0.1em"}}>カテゴリ</div>
          {[{id:"all",name:"すべて",icon:"🏠",count:SITES.length},...CATEGORIES].map(c=>(
            <button key={c.id} onClick={()=>setCat(c.id)}
              style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 12px",borderRadius:8,
                background: cat===c.id ? `${T.teal}18` : "none",
                border: cat===c.id ? `1px solid ${T.teal}44` : "1px solid transparent",
                color: cat===c.id ? T.teal : T.lgray,
                cursor:"pointer",fontSize:13,marginBottom:4,textAlign:"left",fontFamily:"'DM Sans',sans-serif"}}>
              <span>{c.icon}</span>
              <span style={{flex:1}}>{c.name}</span>
              <span style={{fontSize:11,opacity:0.7}}>{c.count}</span>
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{flex:1}}>
          <div style={{fontSize:13,color:T.gray,marginBottom:16}}>{sites.length}件のサイト</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16}}>
            {sites.map(s=>(
              <SiteCard key={s.id} site={s} compact
                onSelect={()=>{setSelectedSite(s);setPage("siteDetail");}} />
            ))}
          </div>
          {sites.length===0 && (
            <div style={{textAlign:"center",padding:60,color:T.gray}}>
              <div style={{fontSize:40,marginBottom:12}}>🔍</div>
              <div>「{search}」に一致するサイトが見つかりません</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SITE DETAIL ────────────────────────────────────────────
function SiteDetailPage({ site, setPage, user, setShowAuth, setPurchased, purchased }) {
  const [tab, setTab] = useState("overview");
  const [showPurchase, setShowPurchase] = useState(false);
  const already = purchased.includes(site.id);

  if(!site) return null;
  const catName = CATEGORIES.find(c=>c.id===site.cat)?.name||"";

  return (
    <div style={{maxWidth:1200,margin:"0 auto",padding:"24px"}} className="fade-in">
      <button onClick={()=>setPage("market")} style={{background:"none",border:"none",color:T.teal,cursor:"pointer",marginBottom:20,fontSize:14,display:"flex",alignItems:"center",gap:6}}>
        ← マーケットに戻る
      </button>

      <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:24,alignItems:"start"}}>
        {/* Left */}
        <div>
          {/* Preview */}
          <div style={{borderRadius:12,overflow:"hidden",marginBottom:24,border:`1px solid ${T.border}`}}>
            <div style={{height:320,background:`linear-gradient(135deg,${site.color}22,${site.color}08)`,
              display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:120}}>{site.preview}</span>
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",gap:4,marginBottom:20,borderBottom:`1px solid ${T.border}`,paddingBottom:0}}>
            {["overview","features","reviews"].map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                style={{background:"none",border:"none",cursor:"pointer",padding:"8px 16px",fontSize:14,
                  color: tab===t?T.teal:T.lgray,
                  borderBottom: tab===t?`2px solid ${T.teal}`:"2px solid transparent",
                  fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s"}}>
                {{overview:"概要",features:"機能詳細",reviews:"レビュー"}[t]}
              </button>
            ))}
          </div>

          {tab==="overview" && (
            <div>
              <h1 className="syne" style={{fontSize:26,fontWeight:800,marginBottom:8}}>{site.title}</h1>
              <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
                <span style={{...css.card2,padding:"3px 12px",borderRadius:20,fontSize:12,border:`1px solid ${T.border}`}}>{catName}</span>
                {site.badge && <span className={`tag badge-pop`}>{site.badge}</span>}
              </div>
              <p style={{color:T.lgray,lineHeight:1.8,fontSize:15,marginBottom:24}}>{site.desc}</p>
              <div style={{...css.card,padding:20,marginBottom:20}}>
                <h3 className="syne" style={{fontSize:14,fontWeight:700,marginBottom:12,color:T.gray,letterSpacing:"0.05em"}}>含まれるもの</h3>
                {["完成済みソースコード一式","セットアップドキュメント","AIチャット修正サポート（初月）","ライセンス：商用利用可"].map(f=>(
                  <div key={f} style={{display:"flex",gap:8,alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${T.border}`,fontSize:14}}>
                    <span style={{color:T.teal}}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab==="features" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {["レスポンシブデザイン","SEO最適化済み","高速ページ読み込み","カスタムドメイン対応","多言語対応可","管理画面付き","APIドキュメント","ソースコード編集可"].map(f=>(
                <div key={f} style={{...css.card,padding:"12px 16px",display:"flex",gap:10,alignItems:"center",fontSize:14}}>
                  <span style={{color:T.teal,fontSize:16}}>⚡</span> {f}
                </div>
              ))}
            </div>
          )}
          {tab==="reviews" && (
            <div>
              {[["Tanaka", 5,"導入から1日で稼動開始。AIチャット修正が神。"], ["Sato", 5,"デザインがプロ並み。コストパフォーマンス最高。"], ["Yamada", 4,"セットアップは少し手間だったが、完成度が高い。"]].map(([name,r,comment])=>(
                <div key={name} style={{...css.card,padding:16,marginBottom:12}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:`${T.teal}22`,border:`1px solid ${T.teal}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:T.teal}}>{name[0]}</div>
                    <span style={{fontWeight:600,fontSize:14}}>{name}</span>
                    <span style={{color:T.gold,fontSize:13}}>{"★".repeat(r)}</span>
                  </div>
                  <p style={{color:T.lgray,fontSize:13,lineHeight:1.6}}>{comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Purchase card */}
        <div style={{...css.card,padding:24,position:"sticky",top:80}}>
          <div style={{fontSize:32,fontWeight:800,color:T.teal,fontFamily:"'Syne',sans-serif",marginBottom:4}}>{fmt(site.price)}</div>
          {site.monthly && <div style={{fontSize:13,color:T.gray,marginBottom:12}}>+ {fmt(site.monthly)} / 月（サポートプラン）</div>}
          <div style={{display:"flex",gap:12,marginBottom:20,padding:"12px 0",borderBottom:`1px solid ${T.border}`}}>
            <div style={{flex:1,textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:700,color:T.gold}}>★ {site.rating}</div>
              <div style={{fontSize:11,color:T.gray}}>評価</div>
            </div>
            <div style={{flex:1,textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:700}}>{site.sales}</div>
              <div style={{fontSize:11,color:T.gray}}>販売数</div>
            </div>
          </div>

          {already ? (
            <div>
              <div style={{background:`${T.teal}18`,border:`1px solid ${T.teal}44`,borderRadius:8,padding:12,textAlign:"center",fontSize:14,color:T.teal,marginBottom:12}}>✅ 購入済み</div>
              <button onClick={()=>setPage("aichat")} className="btn-ghost"
                style={{...css.ghostBtn,width:"100%",padding:"12px",fontSize:14}}>AIで修正する →</button>
            </div>
          ) : (
            <>
              <button onClick={()=>user?setShowPurchase(true):setShowAuth("register")} className="btn-teal"
                style={{...css.tealBtn,width:"100%",padding:"14px",fontSize:15,marginBottom:10,borderRadius:8}}>
                {user ? "購入する" : "無料登録して購入"}
              </button>
              <button style={{...css.ghostBtn,width:"100%",padding:"12px",fontSize:14,borderRadius:8,cursor:"pointer"}}
                className="btn-ghost">
                ウィッシュリストに追加
              </button>
            </>
          )}

          <div style={{marginTop:16,fontSize:12,color:T.gray,lineHeight:1.8}}>
            ✓ 30日間返金保証<br/>
            ✓ 商用利用ライセンス付き<br/>
            ✓ ダウンロード無制限<br/>
            ✓ AIチャット修正サポート付き
          </div>

          <div style={{marginTop:16,padding:"12px 0",borderTop:`1px solid ${T.border}`,fontSize:12,color:T.gray}}>
            出品者: <span style={{color:T.lgray}}>{site.seller}</span>
          </div>
        </div>
      </div>

      {showPurchase && (
        <PurchaseModal
          site={site}
          onClose={()=>setShowPurchase(false)}
          onSuccess={()=>{setPurchased(p=>[...p,site.id]);setShowPurchase(false);}}
        />
      )}
    </div>
  );
}

// ─── PURCHASE MODAL ─────────────────────────────────────────
function PurchaseModal({ site, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState("paypal");
  const [processing, setProcessing] = useState(false);

  const handlePay = () => {
    setProcessing(true);
    setTimeout(()=>{setStep(3);setProcessing(false);},2000);
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{...css.card,width:"100%",maxWidth:480,padding:32,position:"relative"}} className="fade-in">
        <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"none",border:"none",color:T.gray,cursor:"pointer",fontSize:20}}>✕</button>

        {step===1 && (
          <>
            <h2 className="syne" style={{fontSize:20,fontWeight:700,marginBottom:20}}>支払い方法を選択</h2>
            <div style={{marginBottom:20,padding:16,background:T.card2,borderRadius:10,border:`1px solid ${T.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:13,color:T.lgray}}>{site.title}</span>
                <span style={{fontWeight:700,color:T.teal}}>{fmt(site.price)}</span>
              </div>
            </div>
            {["paypal","card","bank"].map(m=>(
              <div key={m} onClick={()=>setMethod(m)}
                style={{padding:"14px 18px",borderRadius:10,border:`1px solid ${method===m?T.teal:T.border}`,
                  background: method===m?`${T.teal}12`:T.card2,
                  cursor:"pointer",marginBottom:8,display:"flex",alignItems:"center",gap:12,transition:"all 0.2s"}}>
                <span style={{fontSize:20}}>{{paypal:"💳",card:"💳",bank:"🏦"}[m]}</span>
                <span style={{fontSize:14,color: method===m?T.teal:T.lgray}}>
                  {{paypal:"PayPal",card:"クレジットカード",bank:"銀行振込"}[m]}
                </span>
                {method===m && <span style={{marginLeft:"auto",color:T.teal}}>✓</span>}
              </div>
            ))}
            <button onClick={()=>setStep(2)} className="btn-teal"
              style={{...css.tealBtn,width:"100%",padding:14,fontSize:15,marginTop:16,borderRadius:8}}>
              確認画面へ →
            </button>
          </>
        )}
        {step===2 && (
          <>
            <h2 className="syne" style={{fontSize:20,fontWeight:700,marginBottom:20}}>購入確認</h2>
            <div style={{padding:20,background:T.card2,borderRadius:10,border:`1px solid ${T.border}`,marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <span style={{color:T.lgray,fontSize:14}}>商品名</span>
                <span style={{fontSize:14}}>{site.title}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <span style={{color:T.lgray,fontSize:14}}>支払い方法</span>
                <span style={{fontSize:14}}>{{paypal:"PayPal",card:"クレジットカード",bank:"銀行振込"}[method]}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,borderTop:`1px solid ${T.border}`}}>
                <span style={{fontWeight:700}}>合計</span>
                <span style={{fontWeight:700,fontSize:18,color:T.teal}}>{fmt(site.price)}</span>
              </div>
            </div>
            <button onClick={handlePay} className="btn-teal"
              style={{...css.tealBtn,width:"100%",padding:14,fontSize:15,borderRadius:8,opacity:processing?0.7:1}}>
              {processing ? "処理中..." : "支払いを確定する"}
            </button>
            <button onClick={()=>setStep(1)}
              style={{...css.ghostBtn,width:"100%",padding:12,fontSize:14,marginTop:8,borderRadius:8,cursor:"pointer"}} className="btn-ghost">
              戻る
            </button>
          </>
        )}
        {step===3 && (
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:60,marginBottom:16}}>🎉</div>
            <h2 className="syne" style={{fontSize:22,fontWeight:700,marginBottom:8}}>購入完了！</h2>
            <p style={{color:T.lgray,marginBottom:24,lineHeight:1.7,fontSize:14}}>
              <strong style={{color:T.white}}>{site.title}</strong> の購入が完了しました。<br/>
              ダッシュボードからアクセスできます。
            </p>
            <button onClick={onSuccess} className="btn-teal"
              style={{...css.tealBtn,padding:"12px 32px",fontSize:14,borderRadius:8}}>
              ダッシュボードへ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AI CHAT PAGE ────────────────────────────────────────────
function AIChatPage({ user, setShowAuth, purchased }) {
  const [messages, setMessages] = useState([
    { role:"assistant", content:"こんにちは！VibeCode Market AIアシスタントです 👋\n\nサイトの修正・カスタマイズをお手伝いします。例えば：\n\n・「ヘッダーの色を#00C9A7に変えて」\n・「トップページに動画を追加したい」\n・「ECサイトの商品一覧ページを3列グリッドにして」\n\n何でもご相談ください！管理画面の情報や現在のサイトURLを共有してもらえるとより正確な提案ができます。" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [contextInfo, setContextInfo] = useState("");
  const [showContext, setShowContext] = useState(false);
  const bottomRef = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  const selectedSite = purchased.length>0 ? SITES.find(s=>s.id===purchased[0]) : null;

  const send = useCallback(async () => {
    if(!input.trim() || loading) return;
    if(!user) { setShowAuth("login"); return; }

    const userMsg = input.trim();
    setInput("");
    setMessages(m=>[...m,{role:"user",content:userMsg}]);
    setLoading(true);

    const sysPrompt = `あなたはVibeCode MarketというバイブコーディングプラットフォームのAIサイト修正アシスタントです。

ユーザーは購入したウェブサイトのカスタマイズ・修正を求めています。
日本語で丁寧に回答し、具体的なコードや手順を提供してください。

${selectedSite ? `現在選択中のサイト: ${selectedSite.title}（カテゴリ: ${CATEGORIES.find(c=>c.id===selectedSite.cat)?.name}）` : ""}
${contextInfo ? `\n管理画面・サイト情報:\n${contextInfo}` : ""}

回答のフォーマット:
- 修正内容を分かりやすく説明する
- 具体的なHTMLやCSSのコードを提供する（コードブロックを使用）
- 修正後の確認方法も伝える
- 追加の質問があれば聞く`;

    try {
      const history = messages.map(m=>({role:m.role,content:m.content}));
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:sysPrompt,
          messages:[...history,{role:"user",content:userMsg}]
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "申し訳ございません、エラーが発生しました。";
      setMessages(m=>[...m,{role:"assistant",content:reply}]);
    } catch(e) {
      setMessages(m=>[...m,{role:"assistant",content:"通信エラーが発生しました。しばらく後でもう一度お試しください。"}]);
    }
    setLoading(false);
  },[input,loading,messages,user,selectedSite,contextInfo,setShowAuth]);

  const handleKey = e => { if(e.key==="Enter" && !e.shiftKey){e.preventDefault();send();} };

  const quickActions = [
    "ヘッダーのナビゲーションにリンクを追加したい",
    "トップのメインビジュアルを変更したい",
    "フッターに会社情報を追加して",
    "スマホ表示を最適化したい",
    "CTAボタンの色とテキストを変更して",
    "商品一覧ページにフィルター機能を追加したい",
  ];

  return (
    <div style={{maxWidth:1100,margin:"0 auto",padding:"24px",display:"grid",gridTemplateColumns:"280px 1fr",gap:20,height:"calc(100vh - 100px)"}}>

      {/* Left panel */}
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {/* Site selector */}
        <div style={{...css.card,padding:16}}>
          <div className="syne" style={{fontSize:12,fontWeight:700,color:T.gray,letterSpacing:"0.1em",marginBottom:12}}>修正対象サイト</div>
          {selectedSite ? (
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <span style={{fontSize:24}}>{selectedSite.preview}</span>
              <div>
                <div style={{fontSize:13,fontWeight:600}}>{selectedSite.title}</div>
                <div style={{fontSize:11,color:T.teal}}>✓ アクティブ</div>
              </div>
            </div>
          ) : (
            <div style={{fontSize:12,color:T.gray,lineHeight:1.7}}>
              サイトを購入するとAI修正サポートが利用できます。<br/>
              <span style={{color:T.teal,cursor:"pointer"}}>マーケットを見る →</span>
            </div>
          )}
        </div>

        {/* Context info */}
        <div style={{...css.card,padding:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div className="syne" style={{fontSize:12,fontWeight:700,color:T.gray,letterSpacing:"0.1em"}}>管理画面情報を共有</div>
            <button onClick={()=>setShowContext(!showContext)}
              style={{background:"none",border:"none",color:T.teal,cursor:"pointer",fontSize:11}}>
              {showContext?"閉じる":"編集"}
            </button>
          </div>
          {showContext ? (
            <textarea className="input" value={contextInfo} onChange={e=>setContextInfo(e.target.value)}
              placeholder="例：Wordpressの管理URL、テーマ名、使用中のプラグインなど..."
              style={{width:"100%",height:120,fontSize:12,lineHeight:1.6}} />
          ) : (
            <div style={{fontSize:12,color:contextInfo?T.lgray:T.gray,lineHeight:1.7}}>
              {contextInfo ? contextInfo.slice(0,80)+(contextInfo.length>80?"...":"") : "管理画面の情報を入力するとAIがより正確に修正できます。"}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div style={{...css.card,padding:16,flex:1,overflow:"auto"}}>
          <div className="syne" style={{fontSize:12,fontWeight:700,color:T.gray,letterSpacing:"0.1em",marginBottom:12}}>よく使う修正</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {quickActions.map(a=>(
              <button key={a} onClick={()=>setInput(a)}
                style={{background:T.card2,border:`1px solid ${T.border}`,borderRadius:6,padding:"8px 10px",
                  fontSize:12,color:T.lgray,cursor:"pointer",textAlign:"left",lineHeight:1.4,
                  fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s"}}
                onMouseEnter={e=>{e.target.style.borderColor=`${T.teal}66`;e.target.style.color=T.white;}}
                onMouseLeave={e=>{e.target.style.borderColor=T.border;e.target.style.color=T.lgray;}}>
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div style={{display:"flex",flexDirection:"column",...css.card,overflow:"hidden"}}>
        {/* Chat header */}
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${T.teal},${T.cyan})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🤖</div>
          <div>
            <div style={{fontWeight:600,fontSize:14}}>VibeCode AIアシスタント</div>
            <div style={{fontSize:11,color:T.teal,display:"flex",alignItems:"center",gap:4}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:T.teal,display:"inline-block"}} className="pulse" />
              オンライン
            </div>
          </div>
          <div style={{marginLeft:"auto",fontSize:12,color:T.gray}}>Claude Sonnet powered</div>
        </div>

        {/* Messages */}
        <div style={{flex:1,overflow:"auto",padding:"20px",display:"flex",flexDirection:"column",gap:14}}>
          {messages.map((m,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start"}} className="slide-in">
              {m.role==="assistant" && (
                <div style={{display:"flex",gap:8,alignItems:"flex-end",width:"100%"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${T.teal},${T.cyan})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0,marginBottom:4}}>🤖</div>
                  <div className="chat-bubble-ai">
                    <div style={{fontSize:14,lineHeight:1.7,whiteSpace:"pre-wrap",color:T.white}}>{m.content}</div>
                  </div>
                </div>
              )}
              {m.role==="user" && (
                <div className="chat-bubble-user">
                  <div style={{fontSize:14,lineHeight:1.7,color:T.white}}>{m.content}</div>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${T.teal},${T.cyan})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>🤖</div>
              <div className="chat-bubble-ai">
                <div style={{display:"flex",gap:4,padding:"4px 0"}}>
                  {[0,1,2].map(i=>(
                    <div key={i} style={{width:8,height:8,borderRadius:"50%",background:T.teal,animation:`pulse 1.4s ${i*0.2}s infinite`}} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{padding:"16px 20px",borderTop:`1px solid ${T.border}`}}>
          {!user && (
            <div style={{background:`${T.orange}18`,border:`1px solid ${T.orange}44`,borderRadius:8,padding:"10px 16px",marginBottom:12,fontSize:13,color:T.orange,display:"flex",alignItems:"center",gap:8}}>
              ⚠️ ログインするとAIチャットが利用できます。
              <span onClick={()=>setShowAuth("login")} style={{cursor:"pointer",textDecoration:"underline"}}>ログイン</span>
            </div>
          )}
          <div style={{display:"flex",gap:10}}>
            <textarea className="input" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey}
              placeholder={user ? "修正内容を日本語で入力... (Shift+Enterで改行)" : "ログインしてAIチャットを利用"}
              disabled={!user || loading}
              style={{flex:1,height:60,lineHeight:1.6,fontSize:14,resize:"none"}} />
            <button onClick={send} disabled={!input.trim()||loading||!user} className="btn-teal"
              style={{...css.tealBtn,width:52,height:60,fontSize:22,opacity:(!input.trim()||loading||!user)?0.4:1,borderRadius:8,flexShrink:0}}>
              ↑
            </button>
          </div>
          <div style={{fontSize:11,color:T.gray,marginTop:6}}>Enter で送信・Shift+Enter で改行</div>
        </div>
      </div>
    </div>
  );
}

// ─── PRICING PAGE ────────────────────────────────────────────
function PricingPage({ user, setShowAuth, setPage }) {
  const [billing, setBilling] = useState("quarterly");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const getPrice = (p) => {
    if(billing==="quarterly") return Math.round(p * 0.95);
    if(billing==="annual") return Math.round(p * 0.8);
    return p;
  };
  const getLabel = () => billing==="quarterly"?"3ヶ月払い（5%OFF）":billing==="annual"?"年払い（20%OFF）":"月払い";

  return (
    <div style={{maxWidth:1100,margin:"0 auto",padding:"40px 24px"}} className="fade-in">
      <div style={{textAlign:"center",marginBottom:48}}>
        <h1 className="syne" style={{fontSize:40,fontWeight:800,marginBottom:12}}>
          シンプルな<span style={{color:T.teal}}>料金プラン</span>
        </h1>
        <p style={{color:T.lgray,fontSize:16,marginBottom:28}}>初期費用ゼロ・3ヶ月分でいつでも始められます</p>

        {/* Billing toggle */}
        <div style={{display:"inline-flex",background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:4,gap:2}}>
          {[["monthly","月払い"],["quarterly","3ヶ月（5%OFF）"],["annual","年払い（20%OFF）"]].map(([v,l])=>(
            <button key={v} onClick={()=>setBilling(v)}
              style={{padding:"8px 18px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif",
                background: billing===v ? T.teal : "none",
                color: billing===v ? T.bg : T.lgray,
                fontWeight: billing===v ? 700 : 400,transition:"all 0.2s"}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,marginBottom:48}}>
        {PLANS.map((plan,i)=>(
          <div key={plan.id} style={{...css.card,padding:32,position:"relative",
            border: i===1?`2px solid ${T.teal}`:`1px solid ${T.border}`,
            background: i===1?`linear-gradient(180deg,${T.teal}08,${T.card})`:T.card}} className="hover-card">
            {i===1 && (
              <div style={{position:"absolute",top:-14,left:"50%",transform:"translateX(-50%)",
                background:T.teal,color:T.bg,fontWeight:700,fontSize:12,padding:"4px 16px",borderRadius:20}}>
                おすすめ
              </div>
            )}
            <div className="syne" style={{fontSize:20,fontWeight:800,marginBottom:6}}>{plan.name}</div>
            <div style={{fontSize:13,color:T.gray,marginBottom:20}}>{plan.desc}</div>
            <div style={{marginBottom:24}}>
              <span className="syne" style={{fontSize:40,fontWeight:800,color:i===1?T.teal:T.white}}>{fmt(getPrice(plan.price))}</span>
              <span style={{fontSize:14,color:T.gray}}> / 月</span>
              {billing!=="monthly" && (
                <div style={{fontSize:12,color:T.teal,marginTop:4}}>{getLabel()}</div>
              )}
              {billing==="quarterly" && (
                <div style={{fontSize:12,color:T.gray,marginTop:2}}>初回 {fmt(getPrice(plan.price)*3)} （3ヶ月）</div>
              )}
            </div>

            <div style={{marginBottom:28}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
                {[
                  [plan.sites===-1?"無制限":plan.sites+"サイト","サイト数"],
                  [plan.ai===-1?"無制限":plan.ai+"回","AI修正/月"],
                  [plan.storage,"ストレージ"],
                ].map(([v,l])=>(
                  <div key={l} style={{background:T.card2,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 12px",textAlign:"center"}}>
                    <div style={{fontWeight:700,color:i===1?T.teal:T.white,fontSize:14}}>{v}</div>
                    <div style={{fontSize:11,color:T.gray}}>{l}</div>
                  </div>
                ))}
              </div>
              {plan.features.map(f=>(
                <div key={f} style={{display:"flex",gap:8,padding:"6px 0",fontSize:13,borderBottom:`1px solid ${T.border}`}}>
                  <span style={{color:T.teal,flexShrink:0}}>✓</span> {f}
                </div>
              ))}
            </div>

            <button onClick={()=>user ? (setSelectedPlan(plan)||setShowModal(true)) : setShowAuth("register")}
              className={i===1?"btn-teal":"btn-ghost"}
              style={{...(i===1?css.tealBtn:css.ghostBtn),width:"100%",padding:14,fontSize:15,borderRadius:8}}>
              {user ? `${plan.name}プランを選択` : "無料登録して開始"}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{maxWidth:720,margin:"0 auto"}}>
        <h2 className="syne" style={{fontSize:24,fontWeight:700,textAlign:"center",marginBottom:28}}>よくある質問</h2>
        {[
          ["初期費用は本当にゼロですか？","はい。登録・プロフィール設定・サイト閲覧はすべて無料です。利用開始時に最短3ヶ月分のサブスクを購入すると即日全機能が使えます。"],
          ["途中でプランを変更できますか？","いつでもアップグレード・ダウングレードが可能です。日割り計算で差額を精算します。"],
          ["AIチャット修正はどのサイトでも使えますか？","マーケットで購入したサイトすべてに適用できます。管理画面情報を共有するとより精度が上がります。"],
          ["マーケットへの出品に別途費用はかかりますか？","プロプラン以上のお客様は無料で出品できます。販売成立時に売上の10%をプラットフォーム手数料としていただきます。"],
          ["解約はいつでもできますか？","マイページからいつでも解約手続きができます。解約後は契約期間終了まで利用可能です。"],
        ].map(([q,a])=>(
          <FaqItem key={q} q={q} a={a} />
        ))}
      </div>

      {showModal && selectedPlan && (
        <SubscribeModal plan={selectedPlan} billing={billing} onClose={()=>setShowModal(false)}
          onSuccess={()=>{setShowModal(false);setPage("dashboard");}} />
      )}
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{...css.card,marginBottom:8,overflow:"hidden"}}>
      <button onClick={()=>setOpen(!open)}
        style={{width:"100%",padding:"16px 20px",background:"none",border:"none",cursor:"pointer",
          display:"flex",justifyContent:"space-between",alignItems:"center",
          color:T.white,fontSize:15,fontWeight:600,fontFamily:"'DM Sans',sans-serif",textAlign:"left"}}>
        {q}
        <span style={{color:T.teal,transition:"transform 0.2s",transform:open?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
      </button>
      {open && <div style={{padding:"0 20px 16px",fontSize:14,color:T.lgray,lineHeight:1.8}}>{a}</div>}
    </div>
  );
}

function SubscribeModal({ plan, billing, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const getPrice = (p) => billing==="quarterly"?Math.round(p*0.95):billing==="annual"?Math.round(p*0.8):p;
  const total = getPrice(plan.price) * (billing==="quarterly"?3:billing==="annual"?12:1);

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{...css.card,width:"100%",maxWidth:460,padding:32}} className="fade-in">
        <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"none",border:"none",color:T.gray,cursor:"pointer",fontSize:20}}>✕</button>
        {step===1 ? (
          <>
            <h2 className="syne" style={{fontSize:20,fontWeight:700,marginBottom:20}}>サブスクリプション確認</h2>
            <div style={{background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:20,marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{color:T.lgray,fontSize:14}}>プラン</span>
                <span style={{fontWeight:600}}>{plan.name}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{color:T.lgray,fontSize:14}}>支払いサイクル</span>
                <span style={{fontSize:14}}>{{"monthly":"月払い","quarterly":"3ヶ月払い","annual":"年払い"}[billing]}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,borderTop:`1px solid ${T.border}`}}>
                <span style={{fontWeight:700}}>合計</span>
                <span style={{fontWeight:700,fontSize:18,color:T.teal}}>{fmt(total)}</span>
              </div>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:13,color:T.lgray,display:"block",marginBottom:6}}>支払い方法</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {["💳 PayPal","💳 クレカ"].map(m=>(
                  <button key={m} style={{background:T.card2,border:`1px solid ${T.teal}`,borderRadius:8,padding:12,color:T.teal,cursor:"pointer",fontSize:14,fontFamily:"'DM Sans',sans-serif"}}>{m}</button>
                ))}
              </div>
            </div>
            <button onClick={()=>{setProcessing(true);setTimeout(()=>{setStep(2);setProcessing(false);},1800);}} className="btn-teal"
              style={{...css.tealBtn,width:"100%",padding:14,fontSize:15,borderRadius:8,opacity:processing?0.7:1}}>
              {processing?"処理中...":"支払いを確定する"}
            </button>
          </>
        ) : (
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:64,marginBottom:16}}>✅</div>
            <h2 className="syne" style={{fontSize:22,fontWeight:700,marginBottom:8}}>ご登録完了！</h2>
            <p style={{color:T.lgray,lineHeight:1.8,fontSize:14,marginBottom:24}}><strong style={{color:T.white}}>{plan.name}プラン</strong>へようこそ！<br/>全機能が今すぐ利用できます。</p>
            <button onClick={onSuccess} className="btn-teal"
              style={{...css.tealBtn,padding:"12px 32px",fontSize:14,borderRadius:8}}>ダッシュボードへ</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DASHBOARD ──────────────────────────────────────────────
function DashboardPage({ user, purchased, setPage, setSelectedSite }) {
  const [tab, setTab] = useState("overview");
  if(!user) return (
    <div style={{textAlign:"center",padding:80,color:T.gray}}>
      <div style={{fontSize:48,marginBottom:16}}>🔐</div>
      <div style={{fontSize:18,marginBottom:8}}>ログインが必要です</div>
    </div>
  );

  const myPurchases = SITES.filter(s=>purchased.includes(s.id));
  const tabs = [{id:"overview",label:"概要"},{id:"sites",label:"マイサイト"},{id:"subscription",label:"サブスク管理"},{id:"sales",label:"売上管理"}];

  return (
    <div style={{maxWidth:1200,margin:"0 auto",padding:"24px"}} className="fade-in">
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:28}}>
        <div style={{width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${T.teal},${T.cyan})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:T.bg}}>
          {user.name[0]}
        </div>
        <div>
          <h1 className="syne" style={{fontSize:24,fontWeight:800}}>こんにちは、{user.name}さん 👋</h1>
          <p style={{color:T.lgray,fontSize:13}}>プロプラン / 有効期限: 2025年12月31日</p>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:10}}>
          <button onClick={()=>setPage("aichat")} className="btn-ghost"
            style={{...css.ghostBtn,padding:"8px 18px",fontSize:13}}>AIチャット</button>
          <button onClick={()=>setPage("upload")} className="btn-teal"
            style={{...css.tealBtn,padding:"8px 18px",fontSize:13}}>サイトを出品</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:4,marginBottom:24,borderBottom:`1px solid ${T.border}`,paddingBottom:0}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{background:"none",border:"none",cursor:"pointer",padding:"10px 18px",fontSize:14,
              color: tab===t.id?T.teal:T.lgray,
              borderBottom: tab===t.id?`2px solid ${T.teal}`:"2px solid transparent",
              fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s"}}>
            {t.label}
          </button>
        ))}
      </div>

      {tab==="overview" && (
        <div>
          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:28}}>
            {[
              {label:"保有サイト数", value:myPurchases.length, icon:"🌐", color:T.teal},
              {label:"AI修正残回数", value:"187 / 300", icon:"🤖", color:T.cyan},
              {label:"今月の売上", value:"¥24,800", icon:"💰", color:T.gold},
              {label:"ストレージ使用", value:"12.3 / 30GB", icon:"💾", color:T.purple},
            ].map(s=>(
              <div key={s.label} style={{...css.card,padding:20}}>
                <div style={{fontSize:24,marginBottom:8}}>{s.icon}</div>
                <div style={{fontSize:20,fontWeight:700,color:s.color,marginBottom:4,fontFamily:"'Syne',sans-serif"}}>{s.value}</div>
                <div style={{fontSize:12,color:T.gray}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Recent */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
            <div style={{...css.card,padding:20}}>
              <h3 className="syne" style={{fontSize:15,fontWeight:700,marginBottom:16}}>最近の購入</h3>
              {myPurchases.length>0 ? myPurchases.slice(0,4).map(s=>(
                <div key={s.id} style={{display:"flex",gap:10,alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
                  <span style={{fontSize:24}}>{s.preview}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600}}>{s.title}</div>
                    <div style={{fontSize:11,color:T.gray}}>{fmt(s.price)}</div>
                  </div>
                  <button onClick={()=>setPage("aichat")} style={{background:"none",border:"none",color:T.teal,cursor:"pointer",fontSize:12}}>AI修正→</button>
                </div>
              )) : (
                <div style={{color:T.gray,fontSize:13,padding:"20px 0",textAlign:"center"}}>
                  まだ購入したサイトはありません。<br/>
                  <span onClick={()=>setPage("market")} style={{color:T.teal,cursor:"pointer"}}>マーケットを見る →</span>
                </div>
              )}
            </div>
            <div style={{...css.card,padding:20}}>
              <h3 className="syne" style={{fontSize:15,fontWeight:700,marginBottom:16}}>AI修正履歴</h3>
              {["ヘッダーロゴを変更","商品画像を3列グリッドに","フッターに地図を追加","CTAボタンの色をティールに"].map((h,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
                  <span style={{color:T.teal,fontSize:14}}>🤖</span>
                  <span style={{fontSize:13,flex:1}}>{h}</span>
                  <span style={{fontSize:11,color:T.gray}}>{i+1}日前</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==="sites" && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
            {myPurchases.map(s=>(
              <div key={s.id} style={{...css.card,overflow:"hidden"}} className="hover-card">
                <div style={{height:100,background:`linear-gradient(135deg,${s.color}22,${s.color}08)`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:40}}>
                  {s.preview}
                </div>
                <div style={{padding:16}}>
                  <div className="syne" style={{fontSize:14,fontWeight:700,marginBottom:4}}>{s.title}</div>
                  <div style={{fontSize:11,color:T.gray,marginBottom:12}}>{CATEGORIES.find(c=>c.id===s.cat)?.name}</div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>setPage("aichat")} className="btn-teal"
                      style={{...css.tealBtn,flex:1,padding:"7px",fontSize:12,borderRadius:6}}>AI修正</button>
                    <button style={{...css.ghostBtn,flex:1,padding:"7px",fontSize:12,borderRadius:6,cursor:"pointer"}} className="btn-ghost">
                      詳細
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {myPurchases.length===0 && (
              <div style={{gridColumn:"1/-1",textAlign:"center",padding:60,color:T.gray}}>
                <div style={{fontSize:48,marginBottom:16}}>🛒</div>
                <div style={{fontSize:16,marginBottom:12}}>まだサイトを購入していません</div>
                <button onClick={()=>setPage("market")} className="btn-teal"
                  style={{...css.tealBtn,padding:"10px 24px",fontSize:14,borderRadius:8}}>
                  マーケットで探す
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {tab==="subscription" && (
        <div style={{maxWidth:600}}>
          <div style={{...css.card,padding:28,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:20}}>
              <div>
                <div className="syne" style={{fontSize:20,fontWeight:700}}>プロプラン</div>
                <div style={{color:T.teal,fontSize:14,marginTop:4}}>✓ アクティブ</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div className="syne" style={{fontSize:28,fontWeight:800,color:T.teal}}>¥7,600</div>
                <div style={{fontSize:12,color:T.gray}}>/ 月（3ヶ月払い）</div>
              </div>
            </div>
            <div style={{marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:13}}>
                <span style={{color:T.lgray}}>AI修正回数</span>
                <span>187 / 300回</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{width:"62%"}} />
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
              {[["次回更新","2025年12月31日"],["残り日数","112日"],["利用サイト数","3 / 15"],["使用容量","12.3 / 30GB"]].map(([k,v])=>(
                <div key={k} style={{background:T.card2,border:`1px solid ${T.border}`,borderRadius:8,padding:"12px 14px"}}>
                  <div style={{fontSize:11,color:T.gray,marginBottom:4}}>{k}</div>
                  <div style={{fontSize:14,fontWeight:600}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setPage("pricing")} className="btn-teal"
                style={{...css.tealBtn,flex:1,padding:12,fontSize:14,borderRadius:8}}>プランをアップグレード</button>
              <button style={{...css.ghostBtn,padding:"12px 20px",fontSize:13,borderRadius:8,cursor:"pointer"}} className="btn-ghost">解約</button>
            </div>
          </div>
          <div style={{...css.card,padding:20}}>
            <h3 className="syne" style={{fontSize:14,fontWeight:700,marginBottom:14,color:T.gray,letterSpacing:"0.05em"}}>請求履歴</h3>
            {[["2025年09月01日","プロプラン（3ヶ月）","¥22,800","完了"],["2025年06月01日","プロプラン（3ヶ月）","¥22,800","完了"]].map(([d,name,p,s])=>(
              <div key={d} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${T.border}`,fontSize:13}}>
                <span style={{color:T.gray,width:120}}>{d}</span>
                <span style={{flex:1}}>{name}</span>
                <span style={{fontWeight:700,color:T.teal}}>{p}</span>
                <span style={{color:T.green||T.teal,fontSize:11}}>● {s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="sales" && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:24}}>
            {[["今月の売上","¥24,800","+18%",T.teal],["累計販売数","34件","+5件/月",T.cyan],["評価スコア","4.8 / 5.0","⭐ x12",T.gold]].map(([l,v,sub,c])=>(
              <div key={l} style={{...css.card,padding:20}}>
                <div style={{fontSize:13,color:T.gray,marginBottom:8}}>{l}</div>
                <div className="syne" style={{fontSize:26,fontWeight:800,color:c,marginBottom:4}}>{v}</div>
                <div style={{fontSize:12,color:T.teal}}>{sub}</div>
              </div>
            ))}
          </div>
          <div style={{...css.card,padding:20}}>
            <h3 className="syne" style={{fontSize:15,fontWeight:700,marginBottom:16}}>出品中のサイト</h3>
            <div style={{color:T.gray,fontSize:13,textAlign:"center",padding:"30px 0"}}>
              <div style={{fontSize:40,marginBottom:12}}>📦</div>
              出品中のサイトはまだありません。<br/>
              <button onClick={()=>setPage("upload")} style={{color:T.teal,background:"none",border:"none",cursor:"pointer",fontSize:13,marginTop:8}}>
                サイトを出品する →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── UPLOAD PAGE ─────────────────────────────────────────────
function UploadPage({ user, setShowAuth }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ title:"", cat:"", price:"", desc:"", preview:"" });
  const [submitted, setSubmitted] = useState(false);
  if(!user) return (
    <div style={{textAlign:"center",padding:80}}>
      <div style={{fontSize:48,marginBottom:16}}>🔐</div>
      <div style={{color:T.gray,fontSize:16,marginBottom:16}}>サイトを出品するにはログインが必要です</div>
      <button onClick={()=>setShowAuth("login")} className="btn-teal"
        style={{...css.tealBtn,padding:"10px 24px",fontSize:14,borderRadius:8}}>ログイン</button>
    </div>
  );
  if(submitted) return (
    <div style={{textAlign:"center",maxWidth:480,margin:"80px auto",padding:24}} className="fade-in">
      <div style={{fontSize:64,marginBottom:20}}>🎉</div>
      <h2 className="syne" style={{fontSize:26,fontWeight:700,marginBottom:12}}>出品申請完了！</h2>
      <p style={{color:T.lgray,lineHeight:1.8,marginBottom:24}}>
        <strong style={{color:T.white}}>{form.title}</strong> の出品申請を受け付けました。<br/>
        審査後（通常1〜2営業日）、マーケットに公開されます。
      </p>
      <button onClick={()=>setSubmitted(false)||setStep(1)||setForm({title:"",cat:"",price:"",desc:"",preview:""})}
        className="btn-teal" style={{...css.tealBtn,padding:"12px 32px",fontSize:14,borderRadius:8}}>
        続けて出品する
      </button>
    </div>
  );

  return (
    <div style={{maxWidth:720,margin:"0 auto",padding:"32px 24px"}} className="fade-in">
      <h1 className="syne" style={{fontSize:28,fontWeight:800,marginBottom:8}}>サイトを出品する</h1>
      <p style={{color:T.lgray,fontSize:14,marginBottom:32}}>バイブコーディングで作ったサイトをマーケットに出品して収益を得ましょう</p>

      {/* Step indicator */}
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:36}}>
        {["サイト情報","価格設定","確認・提出"].map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,
              background: step>i+1?T.teal:step===i+1?T.teal:"none",
              border: `2px solid ${step>=i+1?T.teal:T.border}`,
              color: step>=i+1?T.bg:T.gray}}>
              {step>i+1?"✓":i+1}
            </div>
            <span style={{fontSize:13,color:step===i+1?T.teal:T.gray,fontWeight:step===i+1?600:400}}>{s}</span>
            {i<2 && <span style={{color:T.border}}>—</span>}
          </div>
        ))}
      </div>

      <div style={{...css.card,padding:32}}>
        {step===1 && (
          <div>
            <h3 className="syne" style={{fontSize:16,fontWeight:700,marginBottom:24}}>サイト情報を入力</h3>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:13,color:T.lgray,display:"block",marginBottom:6}}>サイト名 *</label>
              <input className="input" placeholder="例: Ultra Commerce Pro" style={{width:"100%"}}
                value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:13,color:T.lgray,display:"block",marginBottom:6}}>カテゴリ *</label>
              <select className="input" style={{width:"100%",background:T.card2,color:T.white}}
                value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})}>
                <option value="">選択してください</option>
                {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:13,color:T.lgray,display:"block",marginBottom:6}}>説明文 *</label>
              <textarea className="input" placeholder="サイトの特徴・使い方・含まれる機能を詳しく説明してください..."
                style={{width:"100%",height:120,lineHeight:1.6}}
                value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} />
            </div>
            <div style={{marginBottom:24}}>
              <label style={{fontSize:13,color:T.lgray,display:"block",marginBottom:6}}>プレビュー絵文字</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8}}>
                {["🛒","🚀","📅","🎨","📝","🏢","⚙️","🎉","💼","🤖","👥","🍔"].map(e=>(
                  <button key={e} onClick={()=>setForm({...form,preview:e})}
                    style={{width:40,height:40,borderRadius:8,border:`1px solid ${form.preview===e?T.teal:T.border}`,
                      background: form.preview===e?`${T.teal}22`:T.card2,fontSize:20,cursor:"pointer"}}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={()=>setStep(2)} disabled={!form.title||!form.cat||!form.desc} className="btn-teal"
              style={{...css.tealBtn,width:"100%",padding:14,fontSize:15,borderRadius:8,opacity:(!form.title||!form.cat||!form.desc)?0.4:1}}>
              次へ: 価格設定 →
            </button>
          </div>
        )}

        {step===2 && (
          <div>
            <h3 className="syne" style={{fontSize:16,fontWeight:700,marginBottom:24}}>価格を設定</h3>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:13,color:T.lgray,display:"block",marginBottom:6}}>販売価格 (円) *</label>
              <input className="input" type="number" placeholder="例: 4800" style={{width:"100%"}}
                value={form.price} onChange={e=>setForm({...form,price:e.target.value})} />
              <div style={{fontSize:11,color:T.gray,marginTop:6}}>
                * 販売成立時にプラットフォーム手数料10%が差し引かれます。{form.price && `実受取額: ${fmt(Math.round(form.price*0.9))}`}
              </div>
            </div>

            <div style={{background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:16,marginBottom:24}}>
              <div className="syne" style={{fontSize:12,fontWeight:700,color:T.gray,marginBottom:12,letterSpacing:"0.05em"}}>参考: カテゴリ別の相場</div>
              {SITES.filter(s=>s.cat===form.cat).slice(0,3).map(s=>(
                <div key={s.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:13,borderBottom:`1px solid ${T.border}`}}>
                  <span style={{color:T.lgray}}>{s.title}</span>
                  <span style={{color:T.teal,fontWeight:600}}>{fmt(s.price)}</span>
                </div>
              ))}
            </div>

            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setStep(1)} className="btn-ghost"
                style={{...css.ghostBtn,flex:1,padding:14,fontSize:14,borderRadius:8,cursor:"pointer"}}>← 戻る</button>
              <button onClick={()=>setStep(3)} disabled={!form.price} className="btn-teal"
                style={{...css.tealBtn,flex:2,padding:14,fontSize:15,borderRadius:8,opacity:!form.price?0.4:1}}>
                確認へ →
              </button>
            </div>
          </div>
        )}

        {step===3 && (
          <div>
            <h3 className="syne" style={{fontSize:16,fontWeight:700,marginBottom:24}}>出品内容を確認</h3>
            <div style={{background:T.card2,border:`1px solid ${T.teal}33`,borderRadius:12,padding:20,marginBottom:24}}>
              <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:16,paddingBottom:16,borderBottom:`1px solid ${T.border}`}}>
                <div style={{width:56,height:56,background:`linear-gradient(135deg,${T.teal}22,${T.cyan}11)`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>
                  {form.preview||"🌐"}
                </div>
                <div>
                  <div className="syne" style={{fontSize:18,fontWeight:700}}>{form.title}</div>
                  <div style={{fontSize:12,color:T.gray}}>{CATEGORIES.find(c=>c.id===form.cat)?.name}</div>
                </div>
                <div style={{marginLeft:"auto",textAlign:"right"}}>
                  <div style={{fontSize:22,fontWeight:700,color:T.teal}}>{fmt(form.price)}</div>
                  <div style={{fontSize:11,color:T.gray}}>受取 {fmt(Math.round(form.price*0.9))}</div>
                </div>
              </div>
              <p style={{fontSize:13,color:T.lgray,lineHeight:1.7}}>{form.desc}</p>
            </div>

            <div style={{background:`${T.orange}12`,border:`1px solid ${T.orange}33`,borderRadius:8,padding:"12px 16px",marginBottom:20,fontSize:13,color:T.orange,lineHeight:1.7}}>
              ⚠️ 出品後、審査が完了するまで1〜2営業日かかります。審査完了後にメールでお知らせします。
            </div>

            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setStep(2)} className="btn-ghost"
                style={{...css.ghostBtn,flex:1,padding:14,fontSize:14,borderRadius:8,cursor:"pointer"}}>← 戻る</button>
              <button onClick={()=>setSubmitted(true)} className="btn-teal"
                style={{...css.tealBtn,flex:2,padding:14,fontSize:15,borderRadius:8}}>
                出品申請を提出 ✓
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AUTH MODAL ─────────────────────────────────────────────
function AuthModal({ mode, setMode, onClose, onSuccess }) {
  const [form, setForm] = useState({ name:"", email:"", pass:"" });
  const [err, setErr] = useState("");

  const handleSubmit = () => {
    if(mode==="register" && !form.name){ setErr("名前を入力してください"); return; }
    if(!form.email){ setErr("メールアドレスを入力してください"); return; }
    if(!form.pass){ setErr("パスワードを入力してください"); return; }
    onSuccess({ name: form.name||form.email.split("@")[0], email:form.email });
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{...css.card,width:"100%",maxWidth:420,padding:36,position:"relative"}} className="fade-in">
        <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"none",border:"none",color:T.gray,cursor:"pointer",fontSize:20}}>✕</button>

        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:48,height:48,background:`linear-gradient(135deg,${T.teal},${T.cyan})`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,margin:"0 auto 12px"}}>⚡</div>
          <h2 className="syne" style={{fontSize:22,fontWeight:700}}>
            {mode==="login" ? "ログイン" : "無料アカウント作成"}
          </h2>
          <p style={{color:T.gray,fontSize:13,marginTop:6}}>
            {mode==="login" ? "アカウントにサインイン" : "初期費用ゼロで今すぐ始める"}
          </p>
        </div>

        <div style={{display:"flex",gap:4,background:T.card2,borderRadius:8,padding:4,marginBottom:24}}>
          {[["login","ログイン"],["register","新規登録"]].map(([m,l])=>(
            <button key={m} onClick={()=>{setMode(m);setErr("");}}
              style={{flex:1,padding:"8px",borderRadius:6,border:"none",cursor:"pointer",fontSize:14,fontFamily:"'DM Sans',sans-serif",
                background: mode===m?T.teal:"none",
                color: mode===m?T.bg:T.lgray,
                fontWeight: mode===m?700:400,transition:"all 0.2s"}}>
              {l}
            </button>
          ))}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {mode==="register" && (
            <input className="input" placeholder="お名前" style={{width:"100%"}}
              value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          )}
          <input className="input" type="email" placeholder="メールアドレス" style={{width:"100%"}}
            value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
          <input className="input" type="password" placeholder="パスワード" style={{width:"100%"}}
            value={form.pass} onChange={e=>setForm({...form,pass:e.target.value})}
            onKeyDown={e=>e.key==="Enter"&&handleSubmit()} />
        </div>

        {err && <div style={{color:T.orange,fontSize:13,marginTop:10,padding:"8px 12px",background:`${T.orange}12`,borderRadius:6}}>{err}</div>}

        <button onClick={handleSubmit} className="btn-teal"
          style={{...css.tealBtn,width:"100%",padding:14,fontSize:15,borderRadius:8,marginTop:20}}>
          {mode==="login" ? "ログイン" : "無料で始める"}
        </button>

        <p style={{textAlign:"center",fontSize:12,color:T.gray,marginTop:16,lineHeight:1.6}}>
          {mode==="login"
            ? <>アカウントをお持ちでない方 → <span style={{color:T.teal,cursor:"pointer"}} onClick={()=>setMode("register")}>無料登録</span></>
            : <>利用規約・プライバシーポリシーに同意して登録</>}
        </p>
      </div>
    </div>
  );
}

// ─── FOOTER ─────────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer style={{borderTop:`1px solid ${T.border}`,padding:"40px 24px",marginTop:60,background:"#060E1A"}}>
      <div style={{maxWidth:1280,margin:"0 auto",display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:32,marginBottom:32}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <div style={{width:32,height:32,background:`linear-gradient(135deg,${T.teal},${T.cyan})`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>⚡</div>
            <span className="syne" style={{fontWeight:800,fontSize:18}}>Vibe<span style={{color:T.teal}}>Code</span> Market</span>
          </div>
          <p style={{color:T.gray,fontSize:13,lineHeight:1.8,maxWidth:280}}>日本初のサブスク型バイブコーディングマーケットプレイス。初期費用ゼロ・AIチャット修正・売買プラットフォーム。</p>
        </div>
        {[
          ["プラットフォーム",["マーケット","料金プラン","サイトを出品","AIチャット修正"]],
          ["サポート",["ヘルプセンター","利用規約","プライバシー","お問い合わせ"]],
          ["会社情報",["VibeCode Marketについて","採用情報","プレスキット","パートナー"]],
        ].map(([title,links])=>(
          <div key={title}>
            <div className="syne" style={{fontSize:12,fontWeight:700,color:T.gray,letterSpacing:"0.1em",marginBottom:14}}>{title}</div>
            {links.map(l=>(
              <div key={l} style={{color:T.lgray,fontSize:13,marginBottom:8,cursor:"pointer"}}
                onMouseEnter={e=>e.target.style.color=T.teal} onMouseLeave={e=>e.target.style.color=T.lgray}>
                {l}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{borderTop:`1px solid ${T.border}`,paddingTop:20,display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12,color:T.gray}}>
        <span>© 2025 VibeCode Market. All rights reserved.</span>
        <span>Made with ⚡ in Japan</span>
      </div>
    </footer>
  );
}

// ─── MAIN APP ───────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [purchased, setPurchased] = useState([]);
  const [authMode, setAuthMode] = useState("login");

  useEffect(()=>{
    if(showAuth) setAuthMode(showAuth);
  },[showAuth]);

  // Load/save state
  useEffect(()=>{
    const loadStorage = async () => {
      try {
        const u = await window.storage.get("vcm_user");
        if(u) setUser(JSON.parse(u.value));
        const p = await window.storage.get("vcm_purchased");
        if(p) setPurchased(JSON.parse(p.value));
      } catch(e) {}
    };
    loadStorage();
  },[]);

  const handleLogin = async (userData) => {
    setUser(userData);
    setShowAuth(null);
    try { await window.storage.set("vcm_user", JSON.stringify(userData)); } catch(e){}
  };

  const handlePurchase = async (newPurchased) => {
    const p = typeof newPurchased==="function" ? newPurchased(purchased) : newPurchased;
    setPurchased(p);
    try { await window.storage.set("vcm_purchased", JSON.stringify(p)); } catch(e){}
  };

  const renderPage = () => {
    switch(page) {
      case "home":       return <HomePage setPage={setPage} setSelectedSite={setSelectedSite} user={user} setShowAuth={setShowAuth} />;
      case "market":     return <MarketPage setSelectedSite={setSelectedSite} setPage={setPage} />;
      case "siteDetail": return <SiteDetailPage site={selectedSite} setPage={setPage} user={user} setShowAuth={setShowAuth} setPurchased={handlePurchase} purchased={purchased} />;
      case "aichat":     return <AIChatPage user={user} setShowAuth={setShowAuth} purchased={purchased} />;
      case "pricing":    return <PricingPage user={user} setShowAuth={setShowAuth} setPage={setPage} />;
      case "dashboard":  return <DashboardPage user={user} purchased={purchased} setPage={setPage} setSelectedSite={setSelectedSite} />;
      case "upload":     return <UploadPage user={user} setShowAuth={setShowAuth} />;
      default:           return <HomePage setPage={setPage} setSelectedSite={setSelectedSite} user={user} setShowAuth={setShowAuth} />;
    }
  };

  return (
    <div style={{minHeight:"100vh",background:T.bg}}>
      <GlobalStyle />
      <Nav page={page} setPage={setPage} user={user} setShowAuth={setShowAuth} cart={[]} setCart={()=>{}} />
      <main style={{minHeight:"calc(100vh - 60px)"}}>
        {renderPage()}
      </main>
      <Footer setPage={setPage} />

      {showAuth && (
        <AuthModal mode={authMode} setMode={setAuthMode}
          onClose={()=>setShowAuth(null)}
          onSuccess={handleLogin} />
      )}
    </div>
  );
}
