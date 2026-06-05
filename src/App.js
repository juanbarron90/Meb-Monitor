import { useState, useEffect, useRef } from "react";

// ── MEB Engine ────────────────────────────────────────────────────────────────
function calcularH(s, l, t, d) {
  const hBruta = Math.pow(s * l, t) - d;
  const hMax = Math.pow(100, t);
  return Math.max(0, Math.min(10, (hBruta / hMax) * 10));
}
function getEstado(h, modo) {
  if (modo === "explorador") {
    if (h >= 7) return { label: "¡Súper bien!",     color: "#4ade80", fondo: "#052e16", personaje: "🦋", mensaje: "Tu cerebro está volando alto. ¡Protege este momento!" };
    if (h >= 5) return { label: "Bien",              color: "#a3e635", fondo: "#1a2e05", personaje: "🐢", mensaje: "Vas bien. Puedes seguir, pero descansa un poco si puedes." };
    if (h >= 3) return { label: "Un poco cargado",   color: "#fbbf24", fondo: "#2d1a00", personaje: "🐠", mensaje: "Tu cerebro está sintiendo mucho. Es bueno hacer una pausa." };
    return         { label: "Necesito parar",        color: "#f87171", fondo: "#2d0505", personaje: "🐌", mensaje: "Es momento de ir al suelo y descansar. Tu cuerpo lo pide." };
  }
  if (h >= 7) return { label: "Óptimo",          color: "#4ade80", fondo: "#052e16", personaje: "⚡", mensaje: "Estás funcionando bien. Cuida este estado." };
  if (h >= 5) return { label: "Funcionando",     color: "#a3e635", fondo: "#1a2e05", personaje: "🔋", mensaje: "Vas bien, pero monitorea tu energía." };
  if (h >= 3) return { label: "Cargado",         color: "#fbbf24", fondo: "#2d1a00", personaje: "⚠️", mensaje: "Tu sistema está sintiendo presión. Considera un descanso." };
  return         { label: "Al límite",           color: "#f87171", fondo: "#2d0505", personaje: "🛑", mensaje: "Hora de parar y hacer el Efecto Suelo." };
}

// ── Preguntas por modo ────────────────────────────────────────────────────────
const PREGUNTAS_EXPLORADOR = [
  {
    id: "lugar",
    variable: "S",
    pregunta: "¿Cómo se siente el lugar donde estás?",
    tipo: "emojis",
    opciones: [
      { emoji: "😌", label: "Muy tranquilo",       valor: 2   },
      { emoji: "🙂", label: "Normal",              valor: 4   },
      { emoji: "😬", label: "Hay mucho ruido",     valor: 7   },
      { emoji: "🤯", label: "¡Demasiado!",         valor: 9.5 },
    ],
  },
  {
    id: "foco",
    variable: "T",
    pregunta: "¿Puedes pensar con claridad ahora?",
    tipo: "emojis",
    opciones: [
      { emoji: "🔬", label: "¡Súper enfocado!",    valor: 1.8 },
      { emoji: "🧠", label: "Sí, bastante",        valor: 1.3 },
      { emoji: "😶", label: "Más o menos",         valor: 1.0 },
      { emoji: "🌀", label: "No, estoy perdido",   valor: 0.5 },
    ],
  },
  {
    id: "gente",
    variable: "D",
    pregunta: "¿Cuánta gente y conversaciones tuviste hoy?",
    tipo: "emojis",
    opciones: [
      { emoji: "🏠", label: "Casi nada, estuve solo", valor: 5  },
      { emoji: "👥", label: "Lo normal",              valor: 25 },
      { emoji: "😵", label: "Muchísima gente",        valor: 55 },
      { emoji: "💥", label: "¡Demasiado, estoy agotado!", valor: 85 },
    ],
  },
  {
    id: "cuerpo",
    variable: "S_mod",
    pregunta: "¿Cómo se siente tu cuerpo?",
    tipo: "emojis",
    opciones: [
      { emoji: "✨", label: "Descansado y bien",    valor: -1.5 },
      { emoji: "😊", label: "Bien",                 valor: -0.3 },
      { emoji: "😓", label: "Cansado",              valor: 1.0  },
      { emoji: "😣", label: "Muy cansado o con dolor", valor: 2.5 },
    ],
  },
  {
    id: "termometro",
    variable: "D_mod",
    pregunta: "¿Cómo te sientes por dentro ahora mismo?",
    subtitulo: "Toca el termómetro para mostrar cómo estás",
    tipo: "termometro",
    min: 0, max: 10, defaultVal: 3,
    niveles: [
      { hasta: 2,  emoji: "😄", label: "¡Muy bien!"         },
      { hasta: 4,  emoji: "🙂", label: "Bien"               },
      { hasta: 6,  emoji: "😐", label: "Más o menos"        },
      { hasta: 8,  emoji: "😟", label: "No muy bien"        },
      { hasta: 10, emoji: "😭", label: "Muy mal"            },
    ],
  },
];

const PREGUNTAS_JOVEN = [
  {
    id: "lugar",
    variable: "S",
    pregunta: "¿Cómo está el ambiente donde estás ahora?",
    tipo: "emojis",
    opciones: [
      { emoji: "🎧", label: "Tranquilo y controlado",      valor: 2   },
      { emoji: "🏙️", label: "Normal, algo de ruido",       valor: 4   },
      { emoji: "😬", label: "Bastante estimulante",         valor: 6.5 },
      { emoji: "🤯", label: "Caos total, me sobrepasa",     valor: 9.5 },
    ],
  },
  {
    id: "foco",
    variable: "T",
    pregunta: "¿Cómo está tu concentración?",
    tipo: "emojis",
    opciones: [
      { emoji: "🚀", label: "En modo hiperenfoque",         valor: 1.8 },
      { emoji: "🧠", label: "Bien enfocado",                valor: 1.3 },
      { emoji: "😐", label: "Regular",                      valor: 1.0 },
      { emoji: "🌀", label: "No puedo concentrarme",        valor: 0.5 },
    ],
  },
  {
    id: "social",
    variable: "D",
    pregunta: "¿Cuánta interacción social tuviste hoy?",
    subtitulo: "Reuniones, clases, mensajes, tener que 'portarte normal'...",
    tipo: "rango",
    min: 0, max: 100, step: 5, defaultVal: 20,
    etiquetaMin: "Casi nada", etiquetaMax: "Agotado de gente",
  },
  {
    id: "cuerpo",
    variable: "S_mod",
    pregunta: "¿Cómo se siente tu cuerpo físicamente?",
    tipo: "emojis",
    opciones: [
      { emoji: "✨", label: "Descansado y ligero",          valor: -1.5 },
      { emoji: "👌", label: "Bien",                        valor: -0.3 },
      { emoji: "😓", label: "Tenso o cansado",             valor: 1.0  },
      { emoji: "💀", label: "Agotado, al límite",           valor: 2.5  },
    ],
  },
  {
    id: "estres",
    variable: "D_mod",
    pregunta: "Del 0 al 10, ¿qué tan estresado o al límite estás?",
    subtitulo: "Sin filtros. Solo tú y tu sensación real ahora mismo.",
    tipo: "rango",
    min: 0, max: 10, step: 1, defaultVal: 3,
    etiquetaMin: "Para nada", etiquetaMax: "Al límite total",
  },
];

// ── Gauge kids ────────────────────────────────────────────────────────────────
function GaugeKids({ value, estado }) {
  const r = 80, cx = 100, cy = 100;
  const circum = 2 * Math.PI * r;
  const arc = (value / 10) * circum * 0.75;
  return (
    <div style={{ position:"relative", width:200, height:200 }}>
      <svg width="200" height="200" viewBox="0 0 200 200"
        style={{ filter:`drop-shadow(0 0 22px ${estado.color}55)` }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ffffff08" strokeWidth="16"
          strokeDasharray={`${circum*0.75} ${circum*0.25}`} strokeLinecap="round"
          transform={`rotate(135 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={estado.color} strokeWidth="16"
          strokeDasharray={`${arc} ${circum-arc}`} strokeDashoffset={circum*0.25}
          strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`}
          style={{ transition:"stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1), stroke 0.6s" }} />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:44 }}>{estado.personaje}</span>
        <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:800, color:estado.color, marginTop:2, textAlign:"center", maxWidth:100, lineHeight:1.2 }}>
          {estado.label}
        </span>
      </div>
    </div>
  );
}

// ── Termómetro interactivo ─────────────────────────────────────────────────────
function Termometro({ value, onChange }) {
  const niveles = [
    { val:0,  emoji:"😄", color:"#4ade80" },
    { val:2,  emoji:"🙂", color:"#a3e635" },
    { val:4,  emoji:"😐", color:"#facc15" },
    { val:6,  emoji:"😟", color:"#fb923c" },
    { val:8,  emoji:"😭", color:"#f87171" },
    { val:10, emoji:"🤯", color:"#e11d48" },
  ];
  const actual = niveles.reduce((p,c) => value >= c.val ? c : p, niveles[0]);
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
      <div style={{ fontSize:72, lineHeight:1, transition:"all 0.3s" }}>{actual.emoji}</div>
      <div style={{ width:"100%", position:"relative" }}>
        <div style={{ height:20, background:"#0f172a", borderRadius:10, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${value*10}%`, background:actual.color, borderRadius:10, transition:"width 0.2s ease, background 0.3s" }}/>
        </div>
        <input type="range" min={0} max={10} step={1} value={value}
          onChange={e => onChange(parseInt(e.target.value))}
          style={{ position:"absolute", inset:"-6px 0", opacity:0, cursor:"pointer", width:"100%", height:32 }}/>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", width:"100%" }}>
        {niveles.map(n => (
          <button key={n.val} onClick={() => onChange(n.val)}
            style={{ fontSize:22, background:"none", border:"none", cursor:"pointer", opacity: value===n.val?1:0.35, transform: value===n.val?"scale(1.3)":"scale(1)", transition:"all 0.2s" }}>
            {n.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Modo Anclaje ──────────────────────────────────────────────────────────────
function ModoAnclaje({ onClose, modo }) {
  const [step, setStep] = useState(0);
  const [secs, setSecs] = useState(0);
  const [done, setDone] = useState(false);
  const iv = useRef(null);
  const isKids = modo === "explorador";

  const pasos = isKids ? [
    { icon:"⬇️", text:"Busca un espacio libre en el suelo. Puede ser en tu cuarto, sala o donde estés." },
    { icon:"🐢", text:"Acuéstate boca arriba como una tortuga relajada. Brazos a los lados, palmas hacia arriba." },
    { icon:"😌", text:"Cierra los ojos. No tienes que hacer nada. Solo estar aquí." },
    { icon:"⏱️", text:"Quédate quieto 10 minutos. Tu cerebro se está reiniciando solo." },
  ] : [
    { icon:"⬇️", text:"Busca un espacio en el suelo. Superficie firme: madera, concreto, alfombra." },
    { icon:"🫁", text:"Acuéstate boca arriba. Brazos ligeramente separados. Palmas hacia arriba." },
    { icon:"👁️", text:"Cierra los ojos. No hay nada que resolver ahora. Solo estar." },
    { icon:"⏱️", text:"Quédate 10 minutos. Tu sistema nervioso está descargando carga acumulada." },
  ];

  useEffect(() => {
    if (step === 3 && !done) {
      iv.current = setInterval(() => setSecs(s => { if(s>=600){clearInterval(iv.current);setDone(true);return 600;} return s+1; }), 1000);
    }
    return () => clearInterval(iv.current);
  }, [step, done]);

  const m = Math.floor(secs/60), s2 = secs%60;
  const font = isKids ? "'Nunito',sans-serif" : "'DM Mono',monospace";

  return (
    <div style={{ position:"fixed", inset:0, background: isKids?"#0a0a1a":"#020617", zIndex:200, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32 }}>
      <div style={{ maxWidth:360, width:"100%", textAlign:"center" }}>
        <p style={{ fontFamily:font, fontSize: isKids?13:10, color:"#1e293b", letterSpacing: isKids?1:4, marginBottom:36, textTransform:"uppercase", fontWeight: isKids?700:400 }}>
          {isKids ? "🌿 Momento de descanso" : "MODO ANCLAJE · EFECTO SUELO"}
        </p>
        {!done ? <>
          <div style={{ fontSize: isKids?72:60, marginBottom:20 }}>{pasos[step].icon}</div>
          <p style={{ fontFamily:"'Nunito',sans-serif", fontSize: isKids?19:17, color: isKids?"#cbd5e1":"#94a3b8", lineHeight:1.7, marginBottom:32, minHeight:80, fontWeight: isKids?600:400 }}>
            {pasos[step].text}
          </p>
          {step===3 && <div style={{ marginBottom:32 }}>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:46, color:"#4ade80", marginBottom:10 }}>
              {String(m).padStart(2,"0")}:{String(s2).padStart(2,"0")}
            </div>
            <div style={{ height: isKids?10:4, background:"#0f172a", borderRadius:5 }}>
              <div style={{ height:"100%", background:"#4ade80", borderRadius:5, width:`${(secs/600)*100}%`, transition:"width 1s linear" }}/>
            </div>
            {isKids && <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, color:"#334155", marginTop:8, fontWeight:600 }}>10 minutos de recarga 🔋</p>}
          </div>}
          <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
            {step < 3 && <button onClick={()=>setStep(s=>s+1)} style={{ padding:"14px 32px", background:"#4ade8018", border:"1px solid #4ade8044", borderRadius: isKids?20:8, color:"#4ade80", fontFamily:"'Nunito',sans-serif", fontSize: isKids?16:13, cursor:"pointer", fontWeight:700 }}>
              {isKids ? "¡Listo! →" : "LISTO →"}
            </button>}
            <button onClick={onClose} style={{ padding:"14px 22px", background:"transparent", border:"1px solid #1e293b", borderRadius: isKids?20:8, color:"#334155", fontFamily:"'Nunito',sans-serif", fontSize: isKids?14:11, cursor:"pointer" }}>
              {isKids ? "Salir" : "SALIR"}
            </button>
          </div>
        </> : <>
          <div style={{ fontSize:64, marginBottom:20 }}>🌟</div>
          <p style={{ fontFamily:"'Nunito',sans-serif", fontSize: isKids?22:19, color:"#4ade80", marginBottom:10, fontWeight:800 }}>
            {isKids ? "¡Lo lograste!" : "Sesión completada"}
          </p>
          <p style={{ fontFamily:"'Nunito',sans-serif", fontSize: isKids?16:14, color:"#475569", marginBottom:36 }}>
            {isKids ? "Tu cerebro tuvo tiempo de descansar. ¡Bien hecho! 🎉" : "Tu sistema nervioso ha tenido tiempo de regularse."}
          </p>
          <button onClick={onClose} style={{ padding:"14px 32px", background:"#4ade8018", border:"1px solid #4ade8044", borderRadius: isKids?20:8, color:"#4ade80", fontFamily:"'Nunito',sans-serif", fontSize:14, cursor:"pointer", fontWeight:700 }}>
            {isKids ? "Volver 🦋" : "VOLVER AL MONITOR"}
          </button>
        </>}
      </div>
    </div>
  );
}

// ── Cuestionario ──────────────────────────────────────────────────────────────
function Cuestionario({ modo, onComplete }) {
  const preguntas = modo === "explorador" ? PREGUNTAS_EXPLORADOR : PREGUNTAS_JOVEN;
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [rangoVal, setRangoVal] = useState(null);
  const [termoVal, setTermoVal] = useState(3);
  const preg = preguntas[paso];
  const isKids = modo === "explorador";
  const font = "'Nunito',sans-serif";

  const siguiente = (nuevasResp) => {
    setRespuestas(nuevasResp);
    setRangoVal(null);
    setTermoVal(3);
    if (paso < preguntas.length - 1) {
      setPaso(p => p + 1);
    } else {
      const r = nuevasResp;
      const sBase  = r.lugar   ?? 5;
      const sMod   = r.cuerpo  ?? 0;
      const sTotal = Math.min(10, Math.max(0, sBase + sMod));
      const tVal   = r.foco    ?? 1.0;
      const dBase  = r.gente   ?? r.social ?? 20;
      const dRaw   = r.termometro ?? r.estres ?? 3;
      const dMod   = dRaw * 5;
      const dTotal = Math.min(100, dBase + dMod);
      onComplete({ s: sTotal, l: 7.5, t: tVal, d: dTotal });
    }
  };

  const progreso = (paso / preguntas.length) * 100;
  const colorProg = "#4ade80";

  return (
    <div style={{ minHeight:"100vh", background: isKids?"#0a0a1a":"#020617", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-start", padding:"28px 24px 80px" }}>
      {/* Progress */}
      <div style={{ width:"100%", maxWidth:400, marginBottom:32 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, alignItems:"center" }}>
          <span style={{ fontFamily:font, fontSize: isKids?13:10, color: isKids?"#4ade80":"#1e293b", fontWeight: isKids?800:400, letterSpacing: isKids?0:3 }}>
            {isKids ? "🧭 Pregunta " + (paso+1) + " de " + preguntas.length : "CHECK-IN MEB"}
          </span>
          <div style={{ display:"flex", gap:5 }}>
            {preguntas.map((_,i) => (
              <div key={i} style={{ width: isKids?10:6, height: isKids?10:6, borderRadius:"50%", background: i<=paso ? colorProg : "#0f172a", transition:"background 0.3s" }}/>
            ))}
          </div>
        </div>
        <div style={{ height: isKids?8:3, background:"#0f172a", borderRadius:4 }}>
          <div style={{ height:"100%", background:colorProg, borderRadius:4, width:`${progreso}%`, transition:"width 0.4s ease" }}/>
        </div>
      </div>

      <div style={{ width:"100%", maxWidth:400, animation:"fadeIn 0.35s ease" }}>
        {/* Pregunta */}
        <h2 style={{ fontFamily:font, fontSize: isKids?22:20, fontWeight: isKids?800:600, color:"#e2e8f0", lineHeight:1.4, marginBottom: preg.subtitulo?8:28 }}>
          {preg.pregunta}
        </h2>
        {preg.subtitulo && (
          <p style={{ fontFamily:font, fontSize: isKids?14:12, color:"#334155", marginBottom:24, lineHeight:1.5, fontWeight: isKids?600:400 }}>
            {preg.subtitulo}
          </p>
        )}

        {/* Opciones emoji */}
        {preg.tipo === "emojis" && (
          <div style={{ display:"flex", flexDirection:"column", gap: isKids?12:10 }}>
            {preg.opciones.map(op => (
              <button key={op.label}
                onClick={() => siguiente({ ...respuestas, [preg.id]: op.valor })}
                style={{ display:"flex", alignItems:"center", gap:16, padding: isKids?"16px 20px":"14px 18px",
                  background:"#050f1e", border:"1px solid #0f172a", borderRadius: isKids?16:10,
                  cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#334155"; e.currentTarget.style.background="#0c1a2e";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#0f172a"; e.currentTarget.style.background="#050f1e";}}>
                <span style={{ fontSize: isKids?32:24, flexShrink:0 }}>{op.emoji}</span>
                <span style={{ fontFamily:font, fontSize: isKids?16:14, color:"#94a3b8", fontWeight: isKids?700:400 }}>{op.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Termómetro kids */}
        {preg.tipo === "termometro" && (
          <div>
            <Termometro value={termoVal} onChange={setTermoVal} />
            <button onClick={() => siguiente({ ...respuestas, [preg.id]: termoVal })}
              style={{ width:"100%", marginTop:28, padding:"16px", background:"#4ade8018",
                border:"1px solid #4ade8044", borderRadius:16, color:"#4ade80",
                fontFamily:font, fontSize:16, cursor:"pointer", fontWeight:800 }}>
              ¡Eso es cómo me siento! →
            </button>
          </div>
        )}

        {/* Rango joven */}
        {preg.tipo === "rango" && (
          <div>
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:52, fontWeight:700,
                color: rangoVal===null?"#1e293b":
                  (rangoVal/preg.max)>0.7?"#f87171":
                  (rangoVal/preg.max)>0.4?"#fbbf24":"#4ade80"
              }}>{rangoVal!==null?rangoVal:"—"}</span>
              {preg.max===10 && rangoVal!==null && <span style={{ fontFamily:"'DM Mono',monospace", fontSize:18, color:"#334155" }}> / 10</span>}
            </div>
            <div style={{ position:"relative", marginBottom:10 }}>
              <div style={{ height:10, background:"#0f172a", borderRadius:5 }}>
                <div style={{ position:"absolute", left:0, top:0, height:"100%", borderRadius:5,
                  width: rangoVal!==null?`${((rangoVal-preg.min)/(preg.max-preg.min))*100}%`:"0%",
                  background: rangoVal!==null?((rangoVal/preg.max)>0.7?"#f87171":(rangoVal/preg.max)>0.4?"#fbbf24":"#4ade80"):"#1e293b",
                  transition:"width 0.1s, background 0.3s"
                }}/>
              </div>
              <input type="range" min={preg.min} max={preg.max} step={preg.step}
                value={rangoVal??preg.defaultVal}
                onChange={e=>setRangoVal(parseFloat(e.target.value))}
                onMouseDown={()=>{ if(rangoVal===null) setRangoVal(preg.defaultVal); }}
                onTouchStart={()=>{ if(rangoVal===null) setRangoVal(preg.defaultVal); }}
                style={{ position:"absolute", inset:"-10px 0", opacity:0, cursor:"pointer", width:"100%", height:30 }}/>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:28 }}>
              <span style={{ fontFamily:font, fontSize:11, color:"#1e293b" }}>{preg.etiquetaMin}</span>
              <span style={{ fontFamily:font, fontSize:11, color:"#1e293b" }}>{preg.etiquetaMax}</span>
            </div>
            <button onClick={()=>siguiente({...respuestas,[preg.id]:rangoVal??preg.defaultVal})}
              style={{ width:"100%", padding:"15px", background:"#0f172a", border:"1px solid #334155",
                borderRadius:12, color:"#94a3b8", fontFamily:font, fontSize:14, cursor:"pointer", fontWeight:700, transition:"all 0.2s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#4ade80"; e.currentTarget.style.color="#4ade80";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#334155"; e.currentTarget.style.color="#94a3b8";}}>
              Confirmar →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Selector de modo ──────────────────────────────────────────────────────────
function SelectorModo({ onSelect }) {
  return (
    <div style={{ minHeight:"100vh", background:"#060614", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 24px" }}>
      <div style={{ maxWidth:400, width:"100%", textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🧠</div>
        <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:26, fontWeight:800, color:"#e2e8f0", marginBottom:8 }}>MEB · Monitor</h1>
        <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:15, color:"#334155", marginBottom:40, lineHeight:1.6 }}>
          Elige cómo quieres hacer el check-in de hoy
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <button onClick={() => onSelect("explorador")}
            style={{ padding:"22px 24px", background:"#050f1e", border:"2px solid #1e293b", borderRadius:20,
              cursor:"pointer", textAlign:"left", transition:"all 0.2s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#4ade80"; e.currentTarget.style.background="#071a0e";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#1e293b"; e.currentTarget.style.background="#050f1e";}}>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:6 }}>
              <span style={{ fontSize:32 }}>🦋</span>
              <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:19, fontWeight:800, color:"#4ade80" }}>Modo Explorador</span>
            </div>
            <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, color:"#334155", paddingLeft:46, lineHeight:1.5 }}>
              Para niños de 6 a 11 años. Emojis grandes, preguntas sencillas, sin palabras difíciles.
            </p>
          </button>

          <button onClick={() => onSelect("joven")}
            style={{ padding:"22px 24px", background:"#050f1e", border:"2px solid #1e293b", borderRadius:20,
              cursor:"pointer", textAlign:"left", transition:"all 0.2s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#60a5fa"; e.currentTarget.style.background="#071222";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#1e293b"; e.currentTarget.style.background="#050f1e";}}>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:6 }}>
              <span style={{ fontSize:32 }}>⚡</span>
              <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:19, fontWeight:800, color:"#60a5fa" }}>Modo Joven</span>
            </div>
            <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, color:"#334155", paddingLeft:46, lineHeight:1.5 }}>
              Para adolescentes de 12 a 17 años. Directo, sin rodeos, con algo del lenguaje del modelo.
            </p>
          </button>
        </div>
        <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:"#1e293b", marginTop:28 }}>
          El adulto puede cambiar el modo en cualquier momento
        </p>
      </div>
    </div>
  );
}

// ── Historial item ─────────────────────────────────────────────────────────────
function HistItem({ h, ts, estado, modo }) {
  const isKids = modo === "explorador";
  return (
    <div style={{ padding:"12px 0", borderBottom:"1px solid #0a0f1a", display:"flex", alignItems:"center", gap:12 }}>
      <span style={{ fontSize:22 }}>{estado.personaje}</span>
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
          <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:16, color:estado.color, fontWeight:800 }}>
            {isKids ? estado.label : h.toFixed(1)}
          </span>
          {!isKids && <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, color:"#334155" }}>{estado.label}</span>}
        </div>
      </div>
      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#1e293b" }}>{ts}</span>
    </div>
  );
}

// ── App Principal ─────────────────────────────────────────────────────────────
export default function MEBApp() {
  const [pantalla, setPantalla] = useState("selector"); // selector | checkin | monitor | historial
  const [modo, setModo] = useState(null);
  const [vars, setVars] = useState({ s:5, l:7.5, t:1.0, d:20 });
  const [anclajeOpen, setAnclajeOpen] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [ultimoCheckin, setUltimoCheckin] = useState(null);

  const h = calcularH(vars.s, vars.l, vars.t, vars.d);
  const estado = getEstado(h, modo);
  const isKids = modo === "explorador";
  const font = "'Nunito',sans-serif";

  const onModoSelect = (m) => { setModo(m); setPantalla("checkin"); };

  const onCheckInCompleto = (resultado) => {
    setVars(resultado);
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    const hVal = calcularH(resultado.s, resultado.l, resultado.t, resultado.d);
    const est = getEstado(hVal, modo);
    setHistorial(prev => [{ h:hVal, ts, estado:est, modo }, ...prev].slice(0,30));
    setUltimoCheckin(ts);
    setPantalla("monitor");
    if (hVal < 3) setTimeout(() => setAnclajeOpen(true), 900);
  };

  if (pantalla === "selector") return <>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=DM+Mono:wght@400;500&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    <SelectorModo onSelect={onModoSelect} />
  </>;

  if (pantalla === "checkin") return <>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=DM+Mono:wght@400;500&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#4ade80;cursor:pointer;} @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    <Cuestionario modo={modo} onComplete={onCheckInCompleto} />
  </>;

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=DM+Mono:wght@400;500&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#4ade80;cursor:pointer;} @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}} ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:#0f172a;border-radius:2px;}`}</style>
      {anclajeOpen && <ModoAnclaje onClose={() => setAnclajeOpen(false)} modo={modo} />}

      <div style={{ minHeight:"100vh", background: isKids?"#0a0a1a":"#020617", color:"#e2e8f0" }}>
        {/* Header */}
        <div style={{ padding:"18px 22px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontFamily:font, fontSize: isKids?13:10, color:"#1e293b", fontWeight: isKids?800:400, letterSpacing: isKids?0:3 }}>
            {isKids ? "🧠 Mi Monitor MEB" : "MEB · MONITOR v0.2"}
          </span>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:14 }}>{estado.personaje}</span>
            <div style={{ width:8, height:8, borderRadius:"50%", background:estado.color, boxShadow:`0 0 8px ${estado.color}` }}/>
          </div>
        </div>

        {/* Nav */}
        <div style={{ display:"flex", padding:"12px 22px 0", borderBottom:"1px solid #0a0f1a" }}>
          {[["monitor", isKids?"🏠 Inicio":"ESTADO"], ["historial", isKids?"📋 Historial":"HISTORIAL"]].map(([id,lbl]) => (
            <button key={id} onClick={()=>setPantalla(id)} style={{
              padding: isKids?"10px 14px":"8px 14px", background:"transparent", border:"none",
              borderBottom: pantalla===id ? `2px solid ${estado.color}` : "2px solid transparent",
              color: pantalla===id ? estado.color : "#334155",
              fontFamily:font, fontSize: isKids?14:11, fontWeight: isKids?800:400,
              letterSpacing: isKids?0:2, cursor:"pointer", transition:"all 0.2s"
            }}>{lbl}</button>
          ))}
          <button onClick={()=>setPantalla("selector")} style={{
            marginLeft:"auto", padding: isKids?"10px 12px":"8px 12px", background:"transparent", border:"none",
            color:"#1e293b", fontFamily:font, fontSize: isKids?12:10, cursor:"pointer",
            fontWeight: isKids?700:400, letterSpacing: isKids?0:2
          }}>
            {isKids?"🔄 Cambiar":"CAMBIAR MODO"}
          </button>
        </div>

        <div style={{ maxWidth:440, margin:"0 auto", padding:"0 22px 100px" }}>

          {/* ── MONITOR ── */}
          {pantalla === "monitor" && (
            <div style={{ animation:"fadeIn 0.4s ease" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"24px 0 16px" }}>
                {isKids
                  ? <GaugeKids value={h} estado={estado} />
                  : <div>
                      <svg width="204" height="204" viewBox="0 0 204 204" style={{ filter:`drop-shadow(0 0 18px ${estado.color}44)` }}>
                        {(() => { const r=82,cx=102,cy=102,circum=2*Math.PI*r,arc=(h/10)*circum*0.75; return <>
                          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ffffff08" strokeWidth="13" strokeDasharray={`${circum*0.75} ${circum*0.25}`} strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`}/>
                          <circle cx={cx} cy={cy} r={r} fill="none" stroke={estado.color} strokeWidth="13" strokeDasharray={`${arc} ${circum-arc}`} strokeDashoffset={circum*0.25} strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`} style={{ transition:"stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1),stroke 0.6s" }}/>
                          <text x={cx} y={cy-2} textAnchor="middle" fill={estado.color} style={{ fontFamily:"'Nunito',sans-serif", fontSize:38, fontWeight:800, transition:"fill 0.5s" }}>{h.toFixed(1)}</text>
                          <text x={cx} y={cy+20} textAnchor="middle" fill={estado.color+"bb"} style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:700 }}>{estado.label}</text>
                        </>; })()}
                      </svg>
                    </div>
                }
                <p style={{ fontFamily:font, fontSize: isKids?15:13, color:estado.color+"99", marginTop:10, textAlign:"center", maxWidth:280, fontWeight: isKids?700:400, lineHeight:1.5 }}>
                  {estado.mensaje}
                </p>
                {ultimoCheckin && <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#1e293b", marginTop:6, letterSpacing:2 }}>
                  {isKids?"Última vez:":"ÚLTIMO CHECK-IN:"} {ultimoCheckin}
                </p>}
              </div>

              {/* Variables */}
              {!isKids && (
                <div style={{ background:"#050f1e", border:"1px solid #0a0f1a", borderRadius:12, padding:18, marginBottom:14 }}>
                  <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#1e293b", letterSpacing:3, marginBottom:12 }}>VARIABLES CALCULADAS</p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8 }}>
                    {[["S",vars.s,"#f87171"],["L",vars.l,"#60a5fa"],["T",vars.t,"#a78bfa"],["D",vars.d,"#fb923c"]].map(([n,v,c])=>(
                      <div key={n} style={{ textAlign:"center", padding:"10px 4px", background:"#0a0f1a", borderRadius:8 }}>
                        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:n==="D"?13:17, color:c, fontWeight:700 }}>{v.toFixed(n==="D"?0:1)}</div>
                        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#1e293b", marginTop:2 }}>{n}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kids: barra de energía */}
              {isKids && (
                <div style={{ background:"#050f1e", border:"1px solid #0a0f1a", borderRadius:16, padding:20, marginBottom:14 }}>
                  <p style={{ fontFamily:font, fontSize:13, color:"#334155", fontWeight:700, marginBottom:12 }}>🔋 Tu energía ahora</p>
                  <div style={{ height:18, background:"#0f172a", borderRadius:9, overflow:"hidden", marginBottom:8 }}>
                    <div style={{ height:"100%", width:`${h*10}%`, background:estado.color, borderRadius:9, transition:"width 1s ease" }}/>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontFamily:font, fontSize:11, color:"#1e293b", fontWeight:700 }}>😵 Vacía</span>
                    <span style={{ fontFamily:font, fontSize:11, color:"#1e293b", fontWeight:700 }}>🚀 Llena</span>
                  </div>
                </div>
              )}

              {/* Efecto Suelo */}
              {h < 5 && (
                <button onClick={()=>setAnclajeOpen(true)} style={{
                  width:"100%", padding: isKids?"18px":"15px", marginBottom:14,
                  background: h<3?"#f871710d":"#fbbf240d",
                  border:`1px solid ${h<3?"#f87171":"#fbbf24"}44`,
                  borderRadius: isKids?16:12,
                  color: h<3?"#f87171":"#fbbf24",
                  fontFamily:font, fontSize: isKids?16:13, cursor:"pointer",
                  fontWeight: isKids?800:400,
                  animation: h<3?"pulse 2s infinite":"none"
                }}>
                  {isKids
                    ? (h<3 ? "🌿 ¡Necesito el Efecto Suelo!" : "🐢 Quiero descansar un momento")
                    : (h<3 ? "⚠  ACTIVAR EFECTO SUELO" : "INICIAR DESCANSO")}
                </button>
              )}

              <button onClick={()=>setPantalla("checkin")} style={{
                width:"100%", padding: isKids?"16px":"14px", background:"transparent",
                border:"1px solid #0f172a", borderRadius: isKids?16:12, color:"#334155",
                fontFamily:font, fontSize: isKids?15:12, cursor:"pointer",
                fontWeight: isKids?700:400, transition:"all 0.2s"
              }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#334155";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#0f172a";}}>
                {isKids ? "+ Hacer otro check-in 🔄" : "+ NUEVO CHECK-IN"}
              </button>
            </div>
          )}

          {/* ── HISTORIAL ── */}
          {pantalla === "historial" && (
            <div style={{ paddingTop:22, animation:"fadeIn 0.4s ease" }}>
              <div style={{ background:"#050f1e", border:"1px solid #0a0f1a", borderRadius: isKids?16:12, padding:22 }}>
                <p style={{ fontFamily:font, fontSize: isKids?14:10, color:"#1e293b", fontWeight: isKids?800:400, letterSpacing: isKids?0:3, marginBottom:16 }}>
                  {isKids ? "📋 Cómo me he sentido" : "REGISTRO DE CHECK-INS"}
                </p>
                {historial.length === 0
                  ? <p style={{ fontFamily:font, fontSize:13, color:"#1e293b", textAlign:"center", padding:"28px 0" }}>
                      {isKids ? "Haz tu primer check-in para empezar 🌟" : "Completa tu primer check-in para empezar."}
                    </p>
                  : historial.map((item,i) => <HistItem key={i} {...item} />)
                }
              </div>

              {historial.length > 1 && (
                <div style={{ background:"#050f1e", border:"1px solid #0a0f1a", borderRadius: isKids?16:12, padding:20, marginTop:14 }}>
                  <p style={{ fontFamily:font, fontSize: isKids?14:10, color:"#1e293b", fontWeight: isKids?800:400, letterSpacing: isKids?0:3, marginBottom:12 }}>
                    {isKids ? "📊 Mi resumen" : "RESUMEN"}
                  </p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                    {[
                      [isKids?"Promedio":"Promedio H", (historial.reduce((a,b)=>a+b.h,0)/historial.length).toFixed(1), "#60a5fa"],
                      [isKids?"Más bajo":"Mínimo H",  Math.min(...historial.map(x=>x.h)).toFixed(1), "#f87171"],
                      [isKids?"Más alto":"Máximo H",  Math.max(...historial.map(x=>x.h)).toFixed(1), "#4ade80"],
                    ].map(([lbl,val,col])=>(
                      <div key={lbl} style={{ textAlign:"center", background:"#0a0f1a", borderRadius: isKids?12:8, padding:"12px 4px" }}>
                        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:22, color:col, fontWeight:700 }}>{val}</div>
                        <div style={{ fontFamily:font, fontSize:10, color:"#1e293b", marginTop:3, fontWeight: isKids?700:400 }}>{lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={()=>setPantalla("checkin")} style={{
                width:"100%", padding: isKids?"16px":"14px", marginTop:14, background:"#0a0f1a",
                border:"1px solid #0f172a", borderRadius: isKids?16:12, color:"#475569",
                fontFamily:font, fontSize: isKids?15:12, cursor:"pointer", fontWeight: isKids?700:400
              }}>
                {isKids ? "+ Nuevo check-in 🔄" : "+ NUEVO CHECK-IN"}
              </button>
            </div>
          )}
        </div>

        <div style={{ position:"fixed", bottom:0, left:0, right:0, background: isKids?"#0a0a1aee":"#020617ee", backdropFilter:"blur(8px)", borderTop:"1px solid #0a0f1a", padding:"10px 22px", textAlign:"center" }}>
          <span style={{ fontFamily:font, fontSize:9, color:"#0f172a", letterSpacing:2, fontWeight: isKids?700:400 }}>
            {isKids ? "MODELO DE EQUILIBRIO DE BARRON · PROTOTIPO v0.3" : "MODELO DE EQUILIBRIO DE BARRON · PROTOTIPO WEB · v0.3"}
          </span>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.55}}`}</style>
    </>
  );
}
