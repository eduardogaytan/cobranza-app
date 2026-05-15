import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://uyrgczbcpxtucpdenqpi.supabase.co";
const SUPABASE_KEY = "sb_publishable_T1RfV6_6m7_VgPttwO-QKw_8FdLV0OY";

const api = async (path, options = {}) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation",
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || res.statusText);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
};

const COLORS = {
  primary: "#1a3a5c",
  accent: "#2e7d52",
  danger: "#c0392b",
  warn: "#e67e22",
  bg: "#f4f6f9",
  card: "#ffffff",
  border: "#dde3ec",
  text: "#1c2b3a",
  muted: "#6b7c93",
};

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; background: ${COLORS.bg}; color: ${COLORS.text}; min-height: 100vh; }
  input, select, textarea { font-family: inherit; }
  .app { max-width: 480px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; }

  /* Login */
  .login-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; gap: 1.5rem; }
  .login-logo { width: 64px; height: 64px; background: ${COLORS.primary}; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
  .login-logo svg { width: 36px; height: 36px; fill: white; }
  .login-title { font-size: 22px; font-weight: 700; color: ${COLORS.primary}; }
  .login-sub { font-size: 14px; color: ${COLORS.muted}; text-align: center; }
  .login-card { background: ${COLORS.card}; border-radius: 16px; padding: 2rem; width: 100%; border: 1px solid ${COLORS.border}; display: flex; flex-direction: column; gap: 1rem; }
  .field label { display: block; font-size: 12px; font-weight: 600; color: ${COLORS.muted}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
  .field input { width: 100%; padding: 10px 14px; border: 1px solid ${COLORS.border}; border-radius: 8px; font-size: 15px; outline: none; transition: border 0.2s; }
  .field input:focus { border-color: ${COLORS.primary}; }
  .btn-primary { width: 100%; padding: 12px; background: ${COLORS.primary}; color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
  .btn-primary:hover { opacity: 0.9; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .error-msg { background: #fdecea; color: ${COLORS.danger}; padding: 10px 14px; border-radius: 8px; font-size: 13px; }

  /* Header */
  .header { background: ${COLORS.primary}; color: white; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
  .header-title { font-size: 16px; font-weight: 700; }
  .header-sub { font-size: 12px; opacity: 0.75; }
  .header-back { background: rgba(255,255,255,0.15); border: none; color: white; border-radius: 8px; padding: 6px 10px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 4px; }
  .header-logout { background: transparent; border: 1px solid rgba(255,255,255,0.3); color: white; border-radius: 8px; padding: 6px 10px; cursor: pointer; font-size: 12px; }

  /* Cards / Lists */
  .screen { flex: 1; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
  .section-title { font-size: 12px; font-weight: 700; color: ${COLORS.muted}; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 0 2px; }
  .card { background: ${COLORS.card}; border-radius: 12px; border: 1px solid ${COLORS.border}; overflow: hidden; }
  .list-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; cursor: pointer; border-bottom: 1px solid ${COLORS.border}; transition: background 0.15s; }
  .list-item:last-child { border-bottom: none; }
  .list-item:hover { background: #f8fafc; }
  .list-item-name { font-size: 15px; font-weight: 500; }
  .list-item-sub { font-size: 12px; color: ${COLORS.muted}; margin-top: 2px; }
  .list-item-arrow { color: ${COLORS.muted}; font-size: 18px; }
  .badge { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 20px; }
  .badge-green { background: #e8f5ee; color: ${COLORS.accent}; }
  .badge-blue { background: #e8f0fc; color: ${COLORS.primary}; }
  .badge-orange { background: #fef3e8; color: ${COLORS.warn}; }

  /* Summary card */
  .summary-card { background: ${COLORS.primary}; border-radius: 12px; padding: 16px; color: white; }
  .summary-row { display: flex; justify-content: space-between; gap: 8px; }
  .summary-item { flex: 1; }
  .summary-label { font-size: 11px; opacity: 0.7; margin-bottom: 4px; }
  .summary-value { font-size: 20px; font-weight: 700; }
  .summary-value.sm { font-size: 15px; }

  /* Cobro list */
  .cobro-item { padding: 12px 16px; border-bottom: 1px solid ${COLORS.border}; }
  .cobro-item:last-child { border-bottom: none; }
  .cobro-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; }
  .cobro-nombre { font-size: 14px; font-weight: 600; flex: 1; padding-right: 8px; }
  .cobro-codigo { font-size: 11px; color: ${COLORS.muted}; }
  .cobro-meta { font-size: 12px; color: ${COLORS.muted}; margin-bottom: 8px; }
  .cobro-meta span { margin-right: 10px; }
  .cobro-input-row { display: flex; align-items: center; gap: 8px; }
  .cobro-label { font-size: 12px; color: ${COLORS.muted}; white-space: nowrap; }
  .cobro-input { width: 110px; padding: 7px 10px; border: 1px solid ${COLORS.border}; border-radius: 8px; font-size: 14px; font-weight: 600; text-align: right; outline: none; transition: border 0.2s; }
  .cobro-input:focus { border-color: ${COLORS.accent}; }
  .cobro-input.pagado { border-color: ${COLORS.accent}; background: #f0faf4; }
  .cobro-esperado { font-size: 12px; color: ${COLORS.muted}; flex: 1; text-align: right; }
  .cobro-obs { width: 100%; margin-top: 6px; padding: 6px 10px; border: 1px solid ${COLORS.border}; border-radius: 8px; font-size: 12px; resize: none; outline: none; }
  .check-btn { width: 32px; height: 32px; border-radius: 50%; border: 2px solid ${COLORS.border}; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
  .check-btn.active { background: ${COLORS.accent}; border-color: ${COLORS.accent}; }

  /* Bottom bar */
  .bottom-bar { background: ${COLORS.card}; border-top: 1px solid ${COLORS.border}; padding: 12px 16px; display: flex; gap: 10px; position: sticky; bottom: 0; }
  .btn-save { flex: 1; padding: 11px; background: #f0faf4; color: ${COLORS.accent}; border: 1px solid ${COLORS.accent}; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
  .btn-send { flex: 1; padding: 11px; background: ${COLORS.accent}; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
  .btn-send:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Admin */
  .admin-tabs { display: flex; border-bottom: 1px solid ${COLORS.border}; background: ${COLORS.card}; }
  .admin-tab { flex: 1; padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: ${COLORS.muted}; cursor: pointer; border-bottom: 2px solid transparent; }
  .admin-tab.active { color: ${COLORS.primary}; border-bottom-color: ${COLORS.primary}; }
  .cierre-item { padding: 14px 16px; border-bottom: 1px solid ${COLORS.border}; }
  .cierre-item:last-child { border-bottom: none; }
  .cierre-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
  .cierre-meta { font-size: 12px; color: ${COLORS.muted}; }
  .cierre-actions { display: flex; gap: 8px; margin-top: 10px; }
  .btn-approve { flex: 1; padding: 8px; background: ${COLORS.accent}; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
  .btn-reject { flex: 1; padding: 8px; background: white; color: ${COLORS.danger}; border: 1px solid ${COLORS.danger}; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }

  .loading { flex: 1; display: flex; align-items: center; justify-content: center; color: ${COLORS.muted}; font-size: 14px; }
  .empty { text-align: center; padding: 2rem; color: ${COLORS.muted}; font-size: 14px; }
  .saved-dot { width: 8px; height: 8px; border-radius: 50%; background: ${COLORS.accent}; display: inline-block; margin-right: 6px; }
  .toast { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: #1c2b3a; color: white; padding: 10px 20px; border-radius: 20px; font-size: 13px; z-index: 999; white-space: nowrap; }
`;

function fmt(n) {
  if (!n && n !== 0) return "$0";
  return "$" + Number(n).toLocaleString("es-MX", { maximumFractionDigits: 0 });
}


// ─── SEMANA HELPERS ───────────────────────────────────────────────────────────
function getWeekBounds(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=sun, 1=mon
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: monday, end: sunday };
}

function formatWeekLabel(start, end) {
  const opts = { day: 'numeric', month: 'short' };
  return `${start.toLocaleDateString('es-MX', opts)} – ${end.toLocaleDateString('es-MX', opts)}`;
}

function toDateStr(date) {
  return date.toISOString().split('T')[0];
}

function isEditable(weekStart) {
  const today = new Date();
  const todayStr = toDateStr(today);
  const startStr = toDateStr(weekStart);
  
  // Current week always editable
  const { start: currentStart } = getWeekBounds(today);
  const currentStr = toDateStr(currentStart);
  
  // Previous week editable only on Monday
  const { start: prevStart } = getWeekBounds(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000));
  const prevStr = toDateStr(prevStart);
  const isMonday = today.getDay() === 1;
  
  return startStr === currentStr || (isMonday && startStr === prevStr);
}

// ─── WEEK SELECTOR COMPONENT ─────────────────────────────────────────────────
function WeekSelector({ selectedWeek, onSelect }) {
  const [weeks, setWeeks] = useState([]);

  useEffect(() => {
    // Generate last 8 weeks + current
    const today = new Date();
    const weekList = [];
    for (let i = 0; i < 8; i++) {
      const d = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const { start, end } = getWeekBounds(d);
      weekList.push({ start, end, label: formatWeekLabel(start, end) });
    }
    setWeeks(weekList);
    if (!selectedWeek) onSelect(weekList[0]);
  }, []);

  return (
    <div style={{ padding: "8px 16px", background: "#f4f6f9", borderBottom: `1px solid ${COLORS.border}` }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted, textTransform: "uppercase", marginBottom: 6 }}>Semana de cobranza</div>
      <select
        style={{ width: "100%", padding: "8px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, background: "white", color: COLORS.text }}
        value={selectedWeek ? toDateStr(selectedWeek.start) : ""}
        onChange={e => {
          const w = weeks.find(w => toDateStr(w.start) === e.target.value);
          if (w) onSelect(w);
        }}
      >
        {weeks.map((w, i) => (
          <option key={i} value={toDateStr(w.start)}>
            {i === 0 ? `Semana actual: ${w.label}` : w.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  return <div className="toast">{msg}</div>;
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await api(
        `asesores?email=eq.${encodeURIComponent(email)}&password_hash=eq.${encodeURIComponent(pass)}&select=*`
      );
      if (!rows.length) throw new Error("Correo o contraseña incorrectos");
      onLogin(rows[0]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-logo">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
      </div>
      <div>
        <div className="login-title">Sistema de Cobranza</div>
        <div className="login-sub" style={{ marginTop: 4 }}>Ingresa con tu cuenta</div>
      </div>
      <div className="login-card">
        {error && <div className="error-msg">{error}</div>}
        <div className="field">
          <label>Correo electrónico</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
        </div>
        <div className="field">
          <label>Contraseña</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        <button className="btn-primary" onClick={handleLogin} disabled={loading || !email || !pass}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </div>
    </div>
  );
}


// ─── NUEVO CLIENTE FORM ───────────────────────────────────────────────────────
function NuevoClienteForm({ onClose, onSaved }) {
  const [rutas, setRutas] = useState([]);
  const [poblados, setPoblados] = useState([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({
    ruta_id: "", poblado_id: "", codigo: "", nombre: "",
    monto_credito: "", pago_con_intereses: "", abono_original: "",
    plazo: "", fecha_ingreso: "", cobro_semana: "", num_semana: "",
    domicilio: "", celular: "", aval_nombre: "", aval_domicilio: "", aval_celular: ""
  });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  useEffect(() => {
    api("rutas?select=*&order=nombre").then(setRutas).catch(console.error);
  }, []);

  useEffect(() => {
    if (form.ruta_id) {
      api(`poblados?ruta_id=eq.${form.ruta_id}&select=*&order=nombre`).then(setPoblados).catch(console.error);
    } else {
      setPoblados([]);
    }
  }, [form.ruta_id]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const guardar = async () => {
    if (!form.poblado_id || !form.codigo || !form.nombre || !form.monto_credito) {
      return showToast("Llena los campos obligatorios");
    }
    setSaving(true);
    try {
      await api("clientes", {
        method: "POST",
        body: JSON.stringify({
          poblado_id: parseInt(form.poblado_id),
          codigo: form.codigo,
          nombre: form.nombre.toUpperCase(),
          monto_credito: parseFloat(form.monto_credito) || 0,
          pago_con_intereses: parseFloat(form.pago_con_intereses) || 0,
          abono_original: parseFloat(form.abono_original) || 0,
          plazo: parseInt(form.plazo) || 0,
          fecha_ingreso: form.fecha_ingreso || null,
          cobro_semana: parseFloat(form.cobro_semana) || 0,
          num_semana: parseInt(form.num_semana) || 0,
          domicilio: form.domicilio,
          celular: form.celular,
          aval_nombre: form.aval_nombre,
          aval_domicilio: form.aval_domicilio,
          aval_celular: form.aval_celular,
          activo: true,
        }),
      });
      showToast("✓ Cliente guardado");
      setTimeout(() => { onSaved(); onClose(); }, 1000);
    } catch (e) {
      showToast("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { width: "100%", padding: "9px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, outline: "none" };
  const selectStyle = { ...inputStyle, background: "white" };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 };
  const sectionStyle = { fontSize: 12, fontWeight: 700, color: COLORS.primary, textTransform: "uppercase", letterSpacing: "0.08em", padding: "12px 0 6px", borderBottom: `1px solid ${COLORS.border}`, marginBottom: 8 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, overflowY: "auto" }}>
      <div style={{ background: COLORS.card, margin: "20px auto", maxWidth: 480, borderRadius: 16, padding: "20px 16px", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: COLORS.primary }}>Nuevo Cliente</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: COLORS.muted }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={sectionStyle}>Ubicación</div>
          <div>
            <label style={labelStyle}>Ruta *</label>
            <select style={selectStyle} value={form.ruta_id} onChange={e => set("ruta_id", e.target.value)}>
              <option value="">Selecciona ruta...</option>
              {rutas.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Poblado *</label>
            <select style={selectStyle} value={form.poblado_id} onChange={e => set("poblado_id", e.target.value)} disabled={!form.ruta_id}>
              <option value="">Selecciona poblado...</option>
              {poblados.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          <div style={sectionStyle}>Datos del cliente</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={labelStyle}>Código *</label>
              <input style={inputStyle} value={form.codigo} onChange={e => set("codigo", e.target.value)} placeholder="Ej. 1800" />
            </div>
            <div>
              <label style={labelStyle}>Fecha ingreso</label>
              <input style={inputStyle} type="date" value={form.fecha_ingreso} onChange={e => set("fecha_ingreso", e.target.value)} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Nombre completo *</label>
            <input style={inputStyle} value={form.nombre} onChange={e => set("nombre", e.target.value)} placeholder="NOMBRE APELLIDO APELLIDO" />
          </div>
          <div>
            <label style={labelStyle}>Domicilio</label>
            <input style={inputStyle} value={form.domicilio} onChange={e => set("domicilio", e.target.value)} placeholder="Calle # número" />
          </div>
          <div>
            <label style={labelStyle}>Celular</label>
            <input style={inputStyle} value={form.celular} onChange={e => set("celular", e.target.value)} placeholder="10 dígitos" />
          </div>

          <div style={sectionStyle}>Datos del crédito</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={labelStyle}>Monto crédito *</label>
              <input style={inputStyle} type="number" value={form.monto_credito} onChange={e => set("monto_credito", e.target.value)} placeholder="0" />
            </div>
            <div>
              <label style={labelStyle}>Pago con intereses</label>
              <input style={inputStyle} type="number" value={form.pago_con_intereses} onChange={e => set("pago_con_intereses", e.target.value)} placeholder="0" />
            </div>
            <div>
              <label style={labelStyle}>Abono semanal</label>
              <input style={inputStyle} type="number" value={form.abono_original} onChange={e => set("abono_original", e.target.value)} placeholder="0" />
            </div>
            <div>
              <label style={labelStyle}>Plazo (semanas)</label>
              <input style={inputStyle} type="number" value={form.plazo} onChange={e => set("plazo", e.target.value)} placeholder="0" />
            </div>
            <div>
              <label style={labelStyle}>Cobro semana</label>
              <input style={inputStyle} type="number" value={form.cobro_semana} onChange={e => set("cobro_semana", e.target.value)} placeholder="0" />
            </div>
            <div>
              <label style={labelStyle}>Núm. semana</label>
              <input style={inputStyle} type="number" value={form.num_semana} onChange={e => set("num_semana", e.target.value)} placeholder="0" />
            </div>
          </div>

          <div style={sectionStyle}>Datos del aval</div>
          <div>
            <label style={labelStyle}>Nombre del aval</label>
            <input style={inputStyle} value={form.aval_nombre} onChange={e => set("aval_nombre", e.target.value)} placeholder="Nombre completo" />
          </div>
          <div>
            <label style={labelStyle}>Domicilio del aval</label>
            <input style={inputStyle} value={form.aval_domicilio} onChange={e => set("aval_domicilio", e.target.value)} placeholder="Calle # número" />
          </div>
          <div>
            <label style={labelStyle}>Celular del aval</label>
            <input style={inputStyle} value={form.aval_celular} onChange={e => set("aval_celular", e.target.value)} placeholder="10 dígitos" />
          </div>

          {toast && <div style={{ background: "#e8f5ee", color: COLORS.accent, padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>{toast}</div>}

          <button
            onClick={guardar}
            disabled={saving}
            style={{ width: "100%", padding: 13, background: COLORS.primary, color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 4 }}
          >
            {saving ? "Guardando..." : "Guardar cliente"}
          </button>
        </div>
      </div>
    </div>
  );
}


// ─── RENOVACION MODAL ─────────────────────────────────────────────────────────
function RenovacionModal({ cliente, onClose, onSaved }) {
  const [creditos, setCreditos] = useState([]);
  const [selectedCredito, setSelectedCredito] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  useEffect(() => {
    api("tipos_credito?select=*&order=monto,plazo").then(setCreditos).catch(console.error);
  }, []);

  const saldoPendiente = parseFloat(cliente.pago_con_intereses) || 0;
  const semanasRestantes = selectedCredito
    ? Math.ceil(saldoPendiente / (parseFloat(cliente.abono_original) || 1))
    : 0;
  const descuento = selectedCredito
    ? (parseFloat(cliente.abono_original) || 0) * semanasRestantes
    : 0;
  const montoEntrega = selectedCredito
    ? Math.max(0, selectedCredito.monto - descuento)
    : 0;

  const renovar = async () => {
    if (!selectedCredito) return showToast("Selecciona un crédito");
    setSaving(true);
    try {
      // 1. Mark current credit as inactive
      await api(`clientes?id=eq.${cliente.id}`, {
        method: "PATCH",
        prefer: "return=minimal",
        body: JSON.stringify({ activo: false }),
      });

      // 2. Create new credit
      await api("clientes", {
        method: "POST",
        body: JSON.stringify({
          poblado_id: cliente.poblado_id,
          codigo: cliente.codigo,
          nombre: cliente.nombre,
          monto_credito: selectedCredito.monto,
          pago_con_intereses: selectedCredito.total_credito,
          abono_original: selectedCredito.abono,
          plazo: selectedCredito.plazo,
          fecha_ingreso: new Date().toISOString().split('T')[0],
          cobro_semana: selectedCredito.abono,
          num_semana: 1,
          domicilio: cliente.domicilio,
          celular: cliente.celular,
          aval_nombre: cliente.aval_nombre,
          aval_domicilio: cliente.aval_domicilio,
          aval_celular: cliente.aval_celular,
          activo: true,
        }),
      });

      showToast("✓ Renovación registrada");
      setTimeout(() => { onSaved(); onClose(); }, 1000);
    } catch (e) {
      showToast("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { width: "100%", padding: "9px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, outline: "none", background: "white" };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, overflowY: "auto" }}>
      <div style={{ background: COLORS.card, margin: "20px auto", maxWidth: 480, borderRadius: 16, padding: "20px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: COLORS.primary }}>Renovación de crédito</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: COLORS.muted }}>✕</button>
        </div>

        {/* Cliente info */}
        <div style={{ background: "#e8f0fc", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.primary }}>{cliente.nombre}</div>
          <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>
            Saldo pendiente: <strong style={{ color: COLORS.danger }}>{fmt(saldoPendiente)}</strong>
            {" · "}Abono semanal: <strong>{fmt(cliente.abono_original)}</strong>
          </div>
        </div>

        {/* Credit selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Selecciona el nuevo crédito</label>
          <select style={inputStyle} value={selectedCredito?.id || ""} onChange={e => {
            const c = creditos.find(c => c.id === parseInt(e.target.value));
            setSelectedCredito(c || null);
          }}>
            <option value="">-- Selecciona --</option>
            {[14, 16, 20].map(plazo => (
              <optgroup key={plazo} label={`Plazo ${plazo} semanas`}>
                {creditos.filter(c => c.plazo === plazo).map(c => (
                  <option key={c.id} value={c.id}>
                    ${c.monto.toLocaleString('es-MX')} — Abono: ${c.abono.toLocaleString('es-MX')} — Total: ${c.total_credito.toLocaleString('es-MX')}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Calculation */}
        {selectedCredito && (
          <div style={{ background: "#f4f6f9", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, marginBottom: 8 }}>Cálculo de renovación</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: COLORS.muted }}>Monto nuevo crédito</span>
                <span style={{ fontWeight: 600 }}>{fmt(selectedCredito.monto)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: COLORS.muted }}>Semanas restantes × abono ({semanasRestantes} × {fmt(cliente.abono_original)})</span>
                <span style={{ fontWeight: 600, color: COLORS.danger }}>- {fmt(descuento)}</span>
              </div>
              <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 6, display: "flex", justifyContent: "space-between", fontSize: 15 }}>
                <span style={{ fontWeight: 700 }}>Monto a entregar</span>
                <span style={{ fontWeight: 700, color: COLORS.accent }}>{fmt(montoEntrega)}</span>
              </div>
            </div>
            <div style={{ marginTop: 10, padding: "8px 12px", background: "#e8f5ee", borderRadius: 8, fontSize: 12, color: COLORS.accent }}>
              Nuevo crédito: {selectedCredito.plazo} semanas · Abono: {fmt(selectedCredito.abono)} · Total: {fmt(selectedCredito.total_credito)}
            </div>
          </div>
        )}

        {toast && <div style={{ background: "#e8f5ee", color: COLORS.accent, padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{toast}</div>}

        <button
          onClick={renovar}
          disabled={saving || !selectedCredito}
          style={{ width: "100%", padding: 13, background: COLORS.primary, color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" }}
        >
          {saving ? "Procesando..." : "✓ Confirmar renovación"}
        </button>
      </div>
    </div>
  );
}

// ─── ADMIN ───────────────────────────────────────────────────────────────────
function AdminPanel({ asesor, onLogout }) {
  const [tab, setTab] = useState("pendientes");
  const [cierres, setCierres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [showNuevo, setShowNuevo] = useState(false);
  const [procesando, setProcesando] = useState(null);
  const [clienteRenovar, setClienteRenovar] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Get cierres grouped by asesor/semana
      const cobros = await api(
        `cobros?enviado=eq.true&aprobado=eq.${tab === "aprobados" ? "true" : "false"}&select=*,cliente:clientes(id,nombre,codigo,cobro_semana,abono_original,pago_con_intereses,num_semana,poblado:poblados(nombre,ruta:rutas(nombre))),asesor:asesores(id,nombre)`
      );
      
      // Group by asesor
      const grouped = {};
      cobros.forEach(c => {
        const key = c.asesor?.id || 'unknown';
        if (!grouped[key]) {
          grouped[key] = {
            asesor: c.asesor,
            cobros: [],
            totalCobrado: 0,
            totalEsperado: 0,
          };
        }
        grouped[key].cobros.push(c);
        grouped[key].totalCobrado += parseFloat(c.abono) || 0;
        grouped[key].totalEsperado += parseFloat(c.cliente?.cobro_semana) || 0;
      });
      
      setCierres(Object.values(grouped));
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const aprobarCierre = async (grupo) => {
    setProcesando(grupo.asesor?.id);
    try {
      // Process each cobro and update client data
      for (const cobro of grupo.cobros) {
        const cl = cobro.cliente;
        if (!cl) continue;
        
        const abonoPagado = parseFloat(cobro.abono) || 0;
        const abonoOriginal = parseFloat(cl.abono_original) || 0;
        const cobroSemanaActual = parseFloat(cl.cobro_semana) || 0;
        const pagoConIntereses = parseFloat(cl.pago_con_intereses) || 0;

        // Calculate new values
        const nuevoCobroSemana = cobroSemanaActual + abonoOriginal - abonoPagado;
        const nuevoPagoIntereses = pagoConIntereses - abonoPagado;
        const nuevaNumSemana = (cl.num_semana || 0) + 1;
        const liquidado = nuevoPagoIntereses <= 0;

        // Update client
        await api(`clientes?id=eq.${cl.id}`, {
          method: "PATCH",
          prefer: "return=minimal",
          body: JSON.stringify({
            cobro_semana: liquidado ? 0 : Math.max(0, nuevoCobroSemana),
            pago_con_intereses: liquidado ? 0 : Math.max(0, nuevoPagoIntereses),
            num_semana: nuevaNumSemana,
            activo: !liquidado,
          }),
        });

        // Mark cobro as approved
        await api(`cobros?id=eq.${cobro.id}`, {
          method: "PATCH",
          prefer: "return=minimal",
          body: JSON.stringify({ aprobado: true }),
        });
      }

      // Also update clients with no cobro this week (accumulate debt)
      // Get all active clients for this asesor's ruta
      if (grupo.cobros.length > 0) {
        const rutaId = grupo.cobros[0]?.cliente?.poblado?.ruta?.id;
        if (rutaId) {
          // Get semana activa
          const sems = await api("semanas?activa=eq.true&select=*&limit=1");
          const semana = sems[0];
          if (semana) {
            // Get all active clients in this ruta
            const allClientes = await api(
              `clientes?activo=eq.true&select=id,cobro_semana,abono_original,pago_con_intereses,num_semana,poblado:poblados(ruta_id)&poblados.ruta_id=eq.${rutaId}`
            );
            const cobradosIds = new Set(grupo.cobros.map(c => c.cliente?.id));
            
            for (const cl of allClientes) {
              if (!cl.poblado || cl.poblado.ruta_id !== parseInt(rutaId)) continue;
              if (cobradosIds.has(cl.id)) continue; // Already processed
              
              // Client had no cobro this week - accumulate debt
              const abonoOriginal = parseFloat(cl.abono_original) || 0;
              const nuevoCobroSemana = (parseFloat(cl.cobro_semana) || 0) + abonoOriginal;
              const nuevaNumSemana = (cl.num_semana || 0) + 1;

              await api(`clientes?id=eq.${cl.id}`, {
                method: "PATCH",
                prefer: "return=minimal",
                body: JSON.stringify({
                  cobro_semana: nuevoCobroSemana,
                  num_semana: nuevaNumSemana,
                }),
              });
            }
          }
        }
      }

      showToast("✓ Cierre aprobado y datos actualizados");
      load();
    } catch (e) {
      showToast("Error: " + e.message);
      console.error(e);
    } finally {
      setProcesando(null);
    }
  };

  const rechazarCierre = async (grupo) => {
    for (const cobro of grupo.cobros) {
      await api(`cobros?id=eq.${cobro.id}`, {
        method: "PATCH",
        prefer: "return=minimal",
        body: JSON.stringify({ enviado: false }),
      });
    }
    showToast("✗ Cierre rechazado");
    load();
  };

  const exportExcel = async () => {
    const rows = await api(
      `cobros?enviado=eq.true&aprobado=eq.true&select=*,cliente:clientes(nombre,codigo,cobro_semana,domicilio,celular,poblado:poblados(nombre,ruta:rutas(nombre))),asesor:asesores(nombre)`
    );
    const headers = ["Ruta","Poblado","Código","Cliente","Domicilio","Teléfono","Cobro Semana","Abono","Pago Pendiente","Observaciones","Asesor","Fecha"];
    const lines = [headers.join(",")];
    rows.forEach(r => {
      const c = r.cliente || {};
      const p = c.poblado || {};
      const ru = p.ruta || {};
      lines.push([
        ru.nombre, p.nombre, c.codigo, `"${c.nombre}"`, `"${c.domicilio || ""}"`, c.celular,
        c.cobro_semana, r.abono, r.pago_pendiente, `"${r.observaciones || ""}"`, r.asesor?.nombre,
        new Date(r.fecha_registro).toLocaleDateString("es-MX")
      ].join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `cobranza_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    showToast("✓ Descargado");
  };

  return (
    <div className="app">
      <style>{css}</style>
      <div className="header">
        <div>
          <div className="header-title">Panel Administradora</div>
          <div className="header-sub">{asesor.nombre}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="header-logout" onClick={exportExcel}>⬇ Excel</button>
          <button className="header-logout" onClick={onLogout}>Salir</button>
        </div>
      </div>
      <div className="admin-tabs">
        {["pendientes","aprobados"].map(t => (
          <div key={t} className={`admin-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "pendientes" ? "Por revisar" : "Aprobados"}
          </div>
        ))}
      </div>
      <div style={{ padding: "10px 16px" }}>
        <button onClick={() => setShowNuevo(true)} style={{ width: "100%", padding: 11, background: COLORS.primary, color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          + Agregar cliente nuevo
        </button>
      </div>
      {showNuevo && <NuevoClienteForm onClose={() => setShowNuevo(false)} onSaved={load} />}
      {clienteRenovar && <RenovacionModal cliente={clienteRenovar} onClose={() => setClienteRenovar(null)} onSaved={load} />}
      {loading ? <div className="loading">Cargando...</div> : (
        <div className="screen" style={{ paddingTop: 8 }}>
          {!cierres.length && <div className="empty">Sin cierres {tab === "pendientes" ? "por revisar" : "aprobados"}</div>}
          {cierres.map((grupo, idx) => (
            <div key={idx} className="card" style={{ marginBottom: 12 }}>
              {/* Cierre header */}
              <div style={{ background: COLORS.primary, padding: "12px 16px", borderRadius: "12px 12px 0 0" }}>
                <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>
                  {grupo.asesor?.nombre}
                </div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 }}>
                  {grupo.cobros.length} clientes · Cobrado: {fmt(grupo.totalCobrado)} / {fmt(grupo.totalEsperado)}
                </div>
                <div style={{ marginTop: 8, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, grupo.totalEsperado ? (grupo.totalCobrado/grupo.totalEsperado)*100 : 0)}%`, background: "#4ade80", borderRadius: 4 }} />
                </div>
              </div>

              {/* Client list */}
              {grupo.cobros.map(c => {
                const cl = c.cliente || {};
                const po = cl.poblado || {};
                return (
                  <div key={c.id} className="cierre-item">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div className="cierre-title">{cl.nombre}</div>
                        <div className="cierre-meta">{po.nombre}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: parseFloat(c.abono) > 0 ? COLORS.accent : COLORS.danger }}>
                          {fmt(c.abono)}
                        </div>
                        <div style={{ fontSize: 11, color: COLORS.muted }}>/ {fmt(cl.cobro_semana)}</div>
                      </div>
                    </div>
                    {c.observaciones && <div className="cierre-meta" style={{ marginTop: 4, fontStyle: "italic" }}>📝 {c.observaciones}</div>}
                  </div>
                );
              })}

              {/* Actions */}
              {tab === "pendientes" && (
                <div className="cierre-actions" style={{ padding: "12px 16px" }}>
                  <button
                    className="btn-reject"
                    onClick={() => rechazarCierre(grupo)}
                    disabled={procesando === grupo.asesor?.id}
                  >
                    ✗ Rechazar
                  </button>
                  <button
                    className="btn-approve"
                    onClick={() => aprobarCierre(grupo)}
                    disabled={procesando === grupo.asesor?.id}
                  >
                    {procesando === grupo.asesor?.id ? "Procesando..." : "✓ Aprobar cierre"}
                  </button>
                </div>
              )}
              {tab === "aprobados" && (
                <div style={{ padding: "8px 16px 12px" }}>
                  {grupo.cobros.map(c => {
                    const cl = c.cliente || {};
                    if (!cl.id) return null;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setClienteRenovar(cl)}
                        style={{ width: "100%", marginBottom: 6, padding: "8px 12px", background: "#e8f0fc", color: COLORS.primary, border: `1px solid ${COLORS.primary}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left" }}
                      >
                        🔄 Renovar: {cl.nombre}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <Toast msg={toast} />
    </div>
  );
}

// ─── ASESOR: RUTAS ───────────────────────────────────────────────────────────
function RutasScreen({ asesor, onLogout, onSelectRuta }) {
  const [rutas, setRutas] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        let rows;
        if (asesor.es_admin) {
          rows = await api("rutas?select=*,poblados(id)");
        } else {
          rows = await api(`rutas?id=eq.${asesor.ruta_id}&select=*,poblados(id)`);
        }
        setRutas(rows);

        // Cargar stats por ruta
        const statsMap = {};
        for (const r of rows) {
          // Cartera activa = suma de pago_con_intereses de clientes activos
          const clientes = await api(
            `clientes?activo=eq.true&select=pago_con_intereses,cobro_semana,poblado_id,poblados(ruta_id)&poblados.ruta_id=eq.${r.id}`
          );
          // Filtrar solo clientes de esta ruta
          const pobladoIds = (r.poblados || []).map(p => p.id);
          const clientesRuta = clientes.filter(c => pobladoIds.includes(c.poblado_id));

          const carteraActiva = clientesRuta.reduce((s, c) => s + (c.pago_con_intereses || 0), 0);
          const cobroSemana = clientesRuta.reduce((s, c) => s + (c.cobro_semana || 0), 0);

          // Cartera vencida = cobros enviados y aprobados donde pago_pendiente > 0
          const cobros = await api(
            `cobros?enviado=eq.true&select=pago_pendiente,cobro_semana,abono,cliente:clientes(poblado_id)`
          );
          const cobrosRuta = cobros.filter(c => c.cliente && pobladoIds.includes(c.cliente.poblado_id));
          const carteraVencida = cobrosRuta.reduce((s, c) => {
            const vencido = (c.cobro_semana || 0) - (c.abono || 0);
            return s + (vencido > 0 ? vencido : 0);
          }, 0);

          statsMap[r.id] = { carteraActiva, cobroSemana, carteraVencida };
        }
        setStats(statsMap);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [asesor]);

  return (
    <div className="app">
      <style>{css}</style>
      <div className="header">
        <div>
          <div className="header-title">Mis Rutas</div>
          <div className="header-sub">{asesor.nombre}</div>
        </div>
        <button className="header-logout" onClick={onLogout}>Salir</button>
      </div>
      {loading ? <div className="loading">Cargando...</div> : (
        <div className="screen">
          <div className="section-title">Selecciona una ruta</div>
          <div className="card">
            {rutas.map(r => {
              const s = stats[r.id] || {};
              return (
                <div key={r.id} className="list-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }} onClick={() => onSelectRuta(r)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div>
                      <div className="list-item-name">{r.nombre}</div>
                      <div className="list-item-sub">{r.estado} · {(r.poblados || []).length} poblados</div>
                    </div>
                    <div className="list-item-arrow">›</div>
                  </div>
                  {s.carteraActiva !== undefined && (
                    <div style={{ display: 'flex', gap: 8, width: '100%', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, background: '#e8f0fc', borderRadius: 8, padding: '6px 10px' }}>
                        <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 2 }}>Cartera activa</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary }}>{fmt(s.carteraActiva)}</div>
                      </div>
                      <div style={{ flex: 1, background: '#e8f5ee', borderRadius: 8, padding: '6px 10px' }}>
                        <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 2 }}>Cobro semanal</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.accent }}>{fmt(s.cobroSemana)}</div>
                      </div>
                      <div style={{ flex: 1, background: s.carteraVencida > 0 ? '#fdecea' : '#f4f6f9', borderRadius: 8, padding: '6px 10px' }}>
                        <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 2 }}>Cartera vencida</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: s.carteraVencida > 0 ? COLORS.danger : COLORS.muted }}>{fmt(s.carteraVencida)}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ASESOR: POBLADOS ─────────────────────────────────────────────────────────
function PobladosScreen({ asesor, ruta, onBack, onSelectPoblado, selectedWeek, onSelectWeek }) {
  const [poblados, setPoblados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const pobs = await api(`poblados?ruta_id=eq.${ruta.id}&select=*,clientes(id)`);
        setPoblados(pobs);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [ruta]);

  const editable = selectedWeek ? isEditable(selectedWeek.start) : true;

  return (
    <div className="app">
      <style>{css}</style>
      <div className="header">
        <button className="header-back" onClick={onBack}>‹ Rutas</button>
        <div style={{ flex: 1, marginLeft: 12 }}>
          <div className="header-title">{ruta.nombre}</div>
          <div className="header-sub">{selectedWeek ? selectedWeek.label : ""}</div>
        </div>
      </div>
      <WeekSelector selectedWeek={selectedWeek} onSelect={onSelectWeek} />
      {!editable && (
        <div style={{ padding: "8px 16px", background: "#fef3e8", fontSize: 12, color: COLORS.warn, fontWeight: 600 }}>
          📋 Semana anterior — solo lectura
        </div>
      )}
      {loading ? <div className="loading">Cargando...</div> : (
        <div className="screen">
          <div className="section-title">Poblados ({poblados.length})</div>
          <div className="card">
            {poblados.map(p => (
              <div key={p.id} className="list-item" onClick={() => onSelectPoblado(p)}>
                <div>
                  <div className="list-item-name">{p.nombre}</div>
                  <div className="list-item-sub">{(p.clientes || []).length} clientes</div>
                </div>
                <div className="list-item-arrow">›</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ASESOR: COBROS ───────────────────────────────────────────────────────────
function CobrosScreen({ asesor, ruta, poblado, onBack, selectedWeek }) {
  const [clientes, setClientes] = useState([]);
  const [semana, setSemana] = useState(null);
  const [cobros, setCobros] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState("");
  const [enviados, setEnviados] = useState({});

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  useEffect(() => {
    const load = async () => {
      try {
        const [cls, sems] = await Promise.all([
          api(`clientes?poblado_id=eq.${poblado.id}&activo=eq.true&select=*&order=nombre`),
          api("semanas?activa=eq.true&select=*&limit=1"),
        ]);
        setClientes(cls);
        const sem = sems[0] || null;
        setSemana(sem);
        // If selectedWeek differs from active semana, fetch or create semana for that week


        if (sem) {
          const existing = await api(
            `cobros?semana_id=eq.${sem.id}&asesor_id=eq.${asesor.id}&select=*`
          );
          const map = {};
          const envMap = {};
          existing.forEach(c => {
            map[c.cliente_id] = { abono: c.abono, obs: c.observaciones || "", id: c.id };
            if (c.enviado) envMap[c.cliente_id] = true;
          });
          setCobros(map);
          setEnviados(envMap);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [poblado, asesor, semana?.id]);

  const updateCobro = (clienteId, field, value) => {
    setCobros(prev => ({
      ...prev,
      [clienteId]: { ...(prev[clienteId] || {}), [field]: value }
    }));
    setSaved(false);
  };

  const guardar = async (enviar = false) => {
    if (!semana) return showToast("No hay semana activa");
    enviar ? setSending(true) : setSaving(true);
    try {
      for (const cl of clientes) {
        if (enviados[cl.id]) continue;
        const cobro = cobros[cl.id] || {};
        const abono = parseFloat(cobro.abono) || 0;
        const payload = {
          cliente_id: cl.id,
          semana_id: semana.id,
          asesor_id: asesor.id,
          abono,
          cobro_semana: cl.cobro_semana,
          pago_pendiente: cl.pago_con_intereses - abono,
          observaciones: cobro.obs || "",
          enviado: enviar,
          pre_guardado: !enviar ? cobros : null,
        };
        if (cobro.id) {
          await api(`cobros?id=eq.${cobro.id}`, { method: "PATCH", body: JSON.stringify(payload), prefer: "return=minimal" });
        } else {
          const [created] = await api("cobros", { method: "POST", body: JSON.stringify(payload) });
          setCobros(prev => ({ ...prev, [cl.id]: { ...prev[cl.id], id: created.id } }));
        }
      }
      if (enviar) {
        showToast("✓ Cierre enviado a la administradora");
        const newEnv = {};
        clientes.forEach(cl => { newEnv[cl.id] = true; });
        setEnviados(newEnv);
      } else {
        showToast("✓ Pre-guardado correctamente");
        setSaved(true);
      }
    } catch (e) {
      showToast("Error: " + e.message);
    } finally {
      setSaving(false);
      setSending(false);
    }
  };

  const totalEsperado = clientes.reduce((s, cl) => s + (cl.cobro_semana || 0), 0);
  const totalAbonos = clientes.reduce((s, cl) => s + (parseFloat(cobros[cl.id]?.abono) || 0), 0);
  const todosEnviados = clientes.every(cl => enviados[cl.id]);

  const hoyLunes = new Date().getDay() === 1;
  const isReadOnly = selectedWeek ? !isEditable(selectedWeek.start) : false;

  if (loading) return (
    <div className="app"><style>{css}</style><div className="loading">Cargando clientes...</div></div>
  );

  return (
    <div className="app">
      <style>{css}</style>
      <div className="header">
        <button className="header-back" onClick={onBack}>‹ Poblados</button>
        <div style={{ flex: 1, marginLeft: 12 }}>
          <div className="header-title">{poblado.nombre}</div>
          <div className="header-sub">{clientes.length} clientes</div>
        </div>
      </div>

      <div style={{ padding: "12px 16px" }}>
        <div className="summary-card">
          <div className="summary-row">
            <div className="summary-item">
              <div className="summary-label">Cobro esperado</div>
              <div className="summary-value sm">{fmt(totalEsperado)}</div>
            </div>
            <div className="summary-item" style={{ textAlign: "right" }}>
              <div className="summary-label">Abonos registrados</div>
              <div className="summary-value sm">{fmt(totalAbonos)}</div>
            </div>
          </div>
          <div style={{ marginTop: 10, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, totalEsperado ? (totalAbonos / totalEsperado) * 100 : 0)}%`, background: "#4ade80", borderRadius: 4, transition: "width 0.3s" }} />
          </div>
          <div style={{ marginTop: 6, fontSize: 11, opacity: 0.75, textAlign: "right" }}>
            {totalEsperado ? Math.round((totalAbonos / totalEsperado) * 100) : 0}% cobrado
          </div>
        </div>
      </div>

      {saved && (
        <div style={{ padding: "0 16px 8px", fontSize: 12, color: COLORS.accent }}>
          <span className="saved-dot" />Pre-guardado activo
        </div>
      )}

      {isReadOnly && (
        <div style={{ padding: "8px 16px", background: "#fef3e8", margin: "0 16px 8px", borderRadius: 10, fontSize: 13, color: COLORS.warn, fontWeight: 600 }}>
          📋 Semana anterior — solo lectura
        </div>
      )}
      {todosEnviados && !isReadOnly && (
        <div style={{ padding: "8px 16px", background: "#e8f5ee", margin: "0 16px 8px", borderRadius: 10, fontSize: 13, color: COLORS.accent, fontWeight: 600 }}>
          ✓ Cierre enviado — pendiente de aprobación
        </div>
      )}

      <div className="card" style={{ margin: "0 16px", marginBottom: 80 }}>
        {clientes.map(cl => {
          const cobro = cobros[cl.id] || {};
          const abono = parseFloat(cobro.abono) || 0;
          const pagado = abono > 0;
          const yaEnviado = enviados[cl.id];
          return (
            <div key={cl.id} className="cobro-item" style={yaEnviado ? { opacity: 0.6 } : {}}>
              <div className="cobro-header">
                <div>
                  <div className="cobro-nombre">{cl.nombre}</div>
                  <div className="cobro-codigo">Cód. {cl.codigo}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  {yaEnviado && <span className="badge badge-green">Enviado</span>}
                  {pagado && !yaEnviado && <span className="badge badge-blue">Abonado</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1, background: "#e8f5ee", borderRadius: 8, padding: "5px 10px" }}>
                  <div style={{ fontSize: 10, color: COLORS.muted }}>Ha pagado</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.accent }}>{fmt((cl.abono_original * cl.plazo) - cl.pago_con_intereses)}</div>
                </div>
                <div style={{ flex: 1, background: "#fdecea", borderRadius: 8, padding: "5px 10px" }}>
                  <div style={{ fontSize: 10, color: COLORS.muted }}>Saldo pendiente</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.danger }}>{fmt(cl.pago_con_intereses)}</div>
                </div>
              </div>
              <div className="cobro-meta">
                <span>Plazo: {cl.plazo} sem</span>
                <span>Sem {cl.num_semana}</span>
                {cl.celular && <span>📞 {cl.celular}</span>}
              </div>
              <div className="cobro-input-row">
                <div className="cobro-label">Abono:</div>
                <input
                  className={`cobro-input ${pagado ? "pagado" : ""}`}
                  type="number"
                  value={cobro.abono || ""}
                  onChange={e => updateCobro(cl.id, "abono", e.target.value)}
                  placeholder="0"
                  disabled={yaEnviado}
                />
                <div className="cobro-esperado">/ {fmt(cl.cobro_semana)}</div>
              </div>
              <input
                className="cobro-obs"
                placeholder="Observaciones (opcional)"
                value={cobro.obs || ""}
                onChange={e => updateCobro(cl.id, "obs", e.target.value)}
                disabled={yaEnviado}
              />
            </div>
          );
        })}
      </div>

      {!todosEnviados && !isReadOnly && (
        <div className="bottom-bar">
          <button className="btn-save" onClick={() => guardar(false)} disabled={saving}>
            {saving ? "Guardando..." : "💾 Pre-guardar"}
          </button>
          <button
            className="btn-send"
            onClick={() => guardar(true)}
            disabled={sending || !hoyLunes}
            title={!hoyLunes ? "Solo puedes enviar los lunes" : ""}
          >
            {sending ? "Enviando..." : hoyLunes ? "✓ Enviar cierre" : "🔒 Envío: lunes"}
          </button>
        </div>
      )}

      <Toast msg={toast} />
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [asesor, setAsesor] = useState(() => {
    try { return JSON.parse(localStorage.getItem("asesor_session")) || null; } catch { return null; }
  });
  const [ruta, setRuta] = useState(null);
  const [poblado, setPoblado] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);

  const handleLogin = (a) => {
    localStorage.setItem("asesor_session", JSON.stringify(a));
    setAsesor(a);
  };

  const handleLogout = () => {
    localStorage.removeItem("asesor_session");
    setAsesor(null);
    setRuta(null);
    setPoblado(null);
  };

  if (!asesor) return <><style>{css}</style><Login onLogin={handleLogin} /></>;
  if (asesor.es_admin) return <AdminPanel asesor={asesor} onLogout={handleLogout} />;
  if (poblado) return <CobrosScreen asesor={asesor} ruta={ruta} poblado={poblado} onBack={() => setPoblado(null)} selectedWeek={selectedWeek} />;
  if (ruta) return <PobladosScreen asesor={asesor} ruta={ruta} onBack={() => setRuta(null)} onSelectPoblado={p => setPoblado(p)} selectedWeek={selectedWeek} onSelectWeek={setSelectedWeek} />;
  return <RutasScreen asesor={asesor} onLogout={handleLogout} onSelectRuta={r => setRuta(r)} />;
}
