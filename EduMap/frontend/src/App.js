import React, { useState } from "react";

const PO_COUNT = 12;

const PO_STATEMENTS = {
  PO1: "Engineering knowledge — Apply knowledge of mathematics, science, engineering fundamentals, and an engineering specialisation.",
  PO2: "Problem analysis — Identify, formulate, review research literature, and analyze complex engineering problems.",
  PO3: "Design/development of solutions — Design solutions for complex engineering problems and systems.",
  PO4: "Conduct investigations — Use research-based knowledge and methods including design of experiments.",
  PO5: "Modern tool usage — Create, select, and apply appropriate techniques and modern engineering tools.",
  PO6: "The engineer and society — Apply reasoning informed by contextual knowledge to assess societal issues.",
  PO7: "Environment and sustainability — Understand the impact of engineering solutions in societal and environmental contexts.",
  PO8: "Ethics — Apply ethical principles and commit to professional ethics and responsibilities.",
  PO9: "Individual and team work — Function effectively as an individual and as a member or leader in diverse teams.",
  PO10: "Communication — Communicate effectively on complex engineering activities with the engineering community.",
  PO11: "Project management and finance — Demonstrate knowledge and understanding of engineering and management principles.",
  PO12: "Life-long learning — Recognise the need for, and have the preparation and ability to engage in independent learning.",
};

const C = {
  bg:           "#080808",
  surface:      "#111111",
  elevated:     "#1a1a1a",
  border:       "#252525",
  borderMid:    "#333333",
  textPri:      "#f0f0f0",
  textSec:      "#888888",
  textDim:      "#4a4a4a",
  orange:       "#f97316",
  orangeDark:   "#c2662a",
  orangeDim:    "#7c3b0d",
  orangeBg:     "#180e06",
  orangeBorder: "#3d1e08",
  green:        "#22c55e",
  greenBg:      "#061309",
  greenBorder:  "#0d3318",
  red:          "#ef4444",
  redBg:        "#130606",
  redBorder:    "#3a0e0e",
  amber:        "#f59e0b",
  amberBg:      "#150f04",
  amberBorder:  "#3a2808",
  l1color:      "#b45309",
  l1bg:         "#100c04",
  l1border:     "#2e2008",
};

const LEVEL_STYLES = {
  3: { bg: C.orangeBg,  color: C.orange,  border: C.orangeBorder },
  2: { bg: C.amberBg,   color: C.amber,   border: C.amberBorder  },
  1: { bg: C.l1bg,      color: C.l1color, border: C.l1border     },
  0: { bg: "transparent", color: C.textDim, border: "transparent" },
};

const LevelBadge = ({ level }) => {
  const s = LEVEL_STYLES[level] || LEVEL_STYLES[0];
  return (
      <span style={{
        display: "inline-block", minWidth: 28, padding: "2px 9px",
        borderRadius: 6, fontSize: 12, fontWeight: 600,
        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
        textAlign: "center",
      }}>
      {level || "—"}
    </span>
  );
};

const card = {
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: "20px 22px",
};

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  background: C.elevated,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  color: C.textPri, padding: "8px 12px", fontSize: 13,
  outline: "none", marginBottom: 12,
  fontFamily: "inherit",
};

const labelStyle = { fontSize: 12, color: C.textSec, display: "block", marginBottom: 4 };

const btnPrimary   = { padding: "8px 20px", fontSize: 13, fontWeight: 600, background: C.orange, color: "#000", border: `1px solid ${C.orange}`, borderRadius: 8, cursor: "pointer" };
const btnSecondary = { padding: "8px 20px", fontSize: 13, fontWeight: 500, background: C.elevated, color: C.textSec, border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer" };

export default function App() {
  const [courseCode, setCourseCode]               = useState("");
  const [courseName, setCourseName]               = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [cos, setCos]                             = useState([""]);
  const [tableData, setTableData]                 = useState(null);
  const [popup, setPopup]                         = useState(null);
  const [loading, setLoading]                     = useState(false);
  const [activeTab, setActiveTab]                 = useState("add");
  const [popupFilter, setPopupFilter]             = useState("all");

  const addCO    = () => setCos(p => [...p, ""]);
  const removeCO = i  => setCos(p => p.filter((_, j) => j !== i));
  const updateCO = (v, i) => { const a = [...cos]; a[i] = v; setCos(a); };

  const submitCourse = async () => {
    const filteredCOs = cos.filter(c => c.trim());
    if (!courseCode || !courseName || !filteredCOs.length) { alert("Fill all required fields."); return; }
    try {
      setLoading(true);
      const r1 = await fetch("http://localhost:8081/course", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseCode, courseName, courseDescription }) });
      if (!r1.ok) throw new Error("Course API failed");
      const r2 = await fetch("http://localhost:8081/add-cos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId: courseCode, cos: filteredCOs }) });
      if (!r2.ok) throw new Error("CO API failed");
      alert("Saved successfully!");
      setCos([""]); setCourseCode(""); setCourseName(""); setCourseDescription("");
    } catch (e) { console.error(e); alert("Error: Check backend connection."); }
    finally { setLoading(false); }
  };

  const fetchCourse = async () => {
    if (!courseCode) { alert("Enter a course code first."); return; }
    try {
      setLoading(true);
      const res  = await fetch(`http://localhost:8081/course?courseCode=${courseCode}`);
      const data = await res.json();
      setTableData({ ...data, courseOutcomesList: data.courseOutcomesList || [] });
      setActiveTab("view");
    } catch (e) { console.error(e); alert("Fetch error. Check backend."); }
    finally { setLoading(false); }
  };

  const computeMapping = (co, poIndex) => {
    const poKey = `PO${poIndex}`;
    let matchedKeywords = [], unmatchedKeywords = [], totalMatches = 0;
    co.keywords.forEach(k => {
      const matched = k.reasons.filter(r => r.po === poKey).map(r => r.reason);
      if (matched.length) { matchedKeywords.push({ keyword: k.keyword, reasons: matched, count: matched.length }); totalMatches += matched.length; }
      else unmatchedKeywords.push({ keyword: k.keyword });
    });
    const rawScore   = totalMatches / 3;
    const finalLevel = rawScore >= 0.75 ? 3 : rawScore >= 0.5 ? 2 : rawScore >= 0.25 ? 1 : 0;
    return { matchedKeywords, unmatchedKeywords, totalMatches, rawScore, finalLevel };
  };

  const openPopup = (co, poIndex) => { setPopupFilter("all"); setPopup({ co, poIndex, ...computeMapping(co, poIndex) }); };

  return (
      <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", minHeight: "100vh", background: C.bg, color: C.textPri, padding: "28px 20px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 3, height: 30, background: C.orange, borderRadius: 2, flexShrink: 0 }} />
            <div>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.textPri, letterSpacing: "-0.01em" }}>CO–PO mapping system</h1>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: C.textSec }}>AI-assisted keyword analysis for program outcome mapping</p>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 2, marginBottom: 22, background: C.surface, borderRadius: 10, padding: 4, border: `1px solid ${C.border}`, width: "fit-content" }}>
            {["add", "view"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: "6px 18px", fontSize: 13, fontWeight: 500,
                  background: activeTab === tab ? C.elevated : "transparent",
                  color: activeTab === tab ? C.textPri : C.textSec,
                  border: activeTab === tab ? `1px solid ${C.borderMid}` : "1px solid transparent",
                  borderRadius: 7, cursor: "pointer", transition: "all 0.15s",
                }}>
                  {tab === "add" ? "Add / edit course" : "View mapping"}
                </button>
            ))}
          </div>

          {/* ── Add Tab ── */}
          {activeTab === "add" && (
              <div style={{ maxWidth: 660 }}>
                <div style={{ ...card, marginBottom: 12 }}>
                  <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.12em" }}>Course details</p>
                  <label style={labelStyle}>Course code *</label>
                  <input style={inputStyle} placeholder="e.g. CS301" value={courseCode} onChange={e => setCourseCode(e.target.value)} />
                  <label style={labelStyle}>Course name *</label>
                  <input style={inputStyle} placeholder="e.g. Data Structures" value={courseName} onChange={e => setCourseName(e.target.value)} />
                  <label style={labelStyle}>Description</label>
                  <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} placeholder="Brief description..." value={courseDescription} onChange={e => setCourseDescription(e.target.value)} />
                </div>

                <div style={{ ...card, marginBottom: 16 }}>
                  <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.12em" }}>Course outcomes</p>
                  {cos.map((c, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.orange, minWidth: 36 }}>CO{i + 1}</span>
                        <input style={{ ...inputStyle, flex: 1, marginBottom: 0 }} value={c} placeholder={`Describe outcome ${i + 1}…`} onChange={e => updateCO(e.target.value, i)} />
                        {cos.length > 1 && (
                            <button onClick={() => removeCO(i)} style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 7, width: 30, height: 30, cursor: "pointer", color: C.textSec, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>−</button>
                        )}
                      </div>
                  ))}
                  <button onClick={addCO} style={{ fontSize: 12, color: C.textSec, background: "transparent", border: `1px dashed ${C.borderMid}`, borderRadius: 7, padding: "6px 14px", cursor: "pointer", marginTop: 4 }}>+ Add outcome</button>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button disabled={loading} onClick={submitCourse} style={btnPrimary}>{loading ? "Saving…" : "Save course"}</button>
                  <button disabled={loading} onClick={fetchCourse} style={btnSecondary}>{loading ? "Loading…" : "Fetch and view"}</button>
                </div>
              </div>
          )}

          {/* ── View Tab ── */}
          {activeTab === "view" && (
              <div>
                {!tableData ? (
                    <div style={{ ...card, padding: "48px 24px", textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
                      <p style={{ color: C.textSec, marginBottom: 16, fontSize: 14 }}>Enter a course code to view the mapping.</p>
                      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                        <input placeholder="Course code" value={courseCode} onChange={e => setCourseCode(e.target.value)} style={{ ...inputStyle, maxWidth: 180, marginBottom: 0 }} />
                        <button disabled={loading} onClick={fetchCourse} style={btnPrimary}>Fetch</button>
                      </div>
                    </div>
                ) : (
                    <div>
                      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
                        <div>
                          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.textPri }}>{tableData.courseName}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 12, color: C.textSec }}>{tableData.courseCode}</p>
                        </div>
                        <div style={{ display: "flex", gap: 14, fontSize: 12, color: C.textSec, alignItems: "center" }}>
                          {[{ label: "High (3)", color: C.orange }, { label: "Medium (2)", color: C.amber }, { label: "Low (1)", color: C.l1color }].map(l => (
                              <span key={l.label} style={{ display: "flex", gap: 5, alignItems: "center" }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: l.color, display: "inline-block" }} />{l.label}
                      </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface }}>
                        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
                          <thead>
                          <tr>
                            {["CO", "Outcome", ...[...Array(PO_COUNT)].map((_, i) => `PO${i + 1}`)].map((h, i) => (
                                <th key={i} style={{ padding: "10px 12px", textAlign: i <= 1 ? "left" : "center", fontWeight: 700, fontSize: 10, color: C.textDim, background: C.elevated, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.1em", minWidth: i === 1 ? 200 : undefined }}>{h}</th>
                            ))}
                          </tr>
                          </thead>
                          <tbody>
                          {tableData.courseOutcomesList.map((co, idx) => (
                              <tr key={idx}
                                  onMouseEnter={e => e.currentTarget.style.background = C.elevated}
                                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                  style={{ transition: "background 0.1s" }}>
                                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, color: C.orange, fontSize: 12, fontWeight: 700 }}>CO{idx + 1}</td>
                                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, maxWidth: 240, fontSize: 12, color: C.textSec, lineHeight: 1.5 }}>{co.CO}</td>
                                {[...Array(PO_COUNT)].map((_, i) => {
                                  const { finalLevel } = computeMapping(co, i + 1);
                                  return (
                                      <td key={i} onClick={() => openPopup(co, i + 1)} title="Click for keyword breakdown"
                                          style={{ padding: "10px 10px", textAlign: "center", borderBottom: `1px solid ${C.border}`, cursor: "pointer" }}>
                                        {finalLevel > 0 ? <LevelBadge level={finalLevel} /> : <span style={{ color: C.textDim, fontSize: 13 }}>—</span>}
                                      </td>
                                  );
                                })}
                              </tr>
                          ))}
                          </tbody>
                        </table>
                      </div>

                      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                        <input placeholder="Course code" value={courseCode} onChange={e => setCourseCode(e.target.value)} style={{ ...inputStyle, maxWidth: 180, marginBottom: 0 }} />
                        <button disabled={loading} onClick={fetchCourse} style={btnSecondary}>Refresh</button>
                      </div>
                    </div>
                )}
              </div>
          )}
        </div>

        {/* ── POPUP ── */}
        {popup && (() => {
          const s = LEVEL_STYLES[popup.finalLevel];
          const threshold = popup.finalLevel === 3 ? "0.75" : popup.finalLevel === 2 ? "0.50" : popup.finalLevel === 1 ? "0.25" : "0.25";
          const allKeywords = [
            ...popup.matchedKeywords.map(k => ({ ...k, matched: true })),
            ...popup.unmatchedKeywords.map(k => ({ ...k, matched: false })),
          ];
          const visibleKeywords =
              popupFilter === "matched"   ? allKeywords.filter(k => k.matched) :
                  popupFilter === "unmatched" ? allKeywords.filter(k => !k.matched) :
                      allKeywords;

          return (
              <div onClick={e => { if (e.target === e.currentTarget) setPopup(null); }}
                   style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
                <div style={{ background: C.surface, border: `1px solid ${C.borderMid}`, borderRadius: 16, width: "100%", maxWidth: 620, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

                  {/* Header */}
                  <div style={{ padding: "20px 22px 0", flexShrink: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 10, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>CO–PO keyword breakdown</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.textPri }}>PO{popup.poIndex} correlation</p>
                          <LevelBadge level={popup.finalLevel} />
                        </div>
                      </div>
                      <button onClick={() => setPopup(null)} style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 7, width: 28, height: 28, cursor: "pointer", color: C.textSec, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                    </div>

                    {/* CO text */}
                    <div style={{ background: C.elevated, borderRadius: 8, padding: "10px 14px", borderLeft: `2px solid ${C.borderMid}`, marginBottom: 10 }}>
                      <p style={{ margin: 0, fontSize: 10, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Course outcome</p>
                      <p style={{ margin: "3px 0 0", fontSize: 12, color: C.textSec, lineHeight: 1.55 }}>{popup.co.CO}</p>
                    </div>

                    {/* PO statement */}
                    <div style={{ background: C.orangeBg, borderRadius: 8, padding: "10px 14px", borderLeft: `2px solid ${C.orangeBorder}`, marginBottom: 14 }}>
                      <p style={{ margin: 0, fontSize: 10, color: C.orange, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>PO{popup.poIndex}</p>
                      <p style={{ margin: "3px 0 0", fontSize: 12, color: C.orangeDark, lineHeight: 1.55 }}>{PO_STATEMENTS[`PO${popup.poIndex}`]}</p>
                    </div>

                    {/* Filter tabs */}
                    <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                      {[
                        { key: "all",       label: `All (${allKeywords.length})`,                        ac: C.orange, ab: C.orangeBg, abr: C.orangeBorder },
                        { key: "matched",   label: `Matched (${popup.matchedKeywords.length})`,           ac: C.green,  ab: C.greenBg,  abr: C.greenBorder  },
                        { key: "unmatched", label: `Unmatched (${popup.unmatchedKeywords.length})`,       ac: C.red,    ab: C.redBg,    abr: C.redBorder    },
                      ].map(f => {
                        const active = popupFilter === f.key;
                        return (
                            <button key={f.key} onClick={() => setPopupFilter(f.key)} style={{
                              padding: "5px 12px", fontSize: 11, fontWeight: 600, borderRadius: 20,
                              cursor: "pointer", transition: "all 0.15s",
                              background: active ? f.ab : "transparent",
                              color: active ? f.ac : C.textSec,
                              border: active ? `1px solid ${f.abr}` : `1px solid ${C.border}`,
                            }}>{f.label}</button>
                        );
                      })}
                    </div>
                    <div style={{ borderBottom: `1px solid ${C.border}` }} />
                  </div>

                  {/* Scrollable body */}
                  <div style={{ overflowY: "auto", padding: "16px 22px 22px", flex: 1 }}>
                    {visibleKeywords.length === 0 ? (
                        <p style={{ color: C.textDim, fontSize: 13, textAlign: "center", padding: "24px 0" }}>No keywords to show.</p>
                    ) : (
                        <div style={{ marginBottom: 20 }}>
                          {visibleKeywords.map((k, i) => (
                              <div key={i} style={{ marginBottom: 8, borderRadius: 9, border: `1px solid ${k.matched ? C.greenBorder : C.border}`, background: k.matched ? C.greenBg : C.elevated, overflow: "hidden" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 13px", borderBottom: `1px solid ${k.matched ? C.greenBorder : C.border}` }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: k.matched ? C.green : C.red }} />
                                    <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 20, background: k.matched ? C.greenBg : C.redBg, color: k.matched ? C.green : C.red, border: `1px solid ${k.matched ? C.greenBorder : C.redBorder}` }}>
                              {k.keyword}
                            </span>
                                  </div>
                                  <span style={{ fontSize: 11, fontWeight: 600, color: k.matched ? C.green : C.red, background: k.matched ? C.greenBg : C.redBg, border: `1px solid ${k.matched ? C.greenBorder : C.redBorder}`, padding: "2px 10px", borderRadius: 20 }}>
                            {k.matched ? `+${k.count} match${k.count !== 1 ? "es" : ""}` : "no match"}
                          </span>
                                </div>
                                <div style={{ padding: "10px 13px" }}>
                                  {k.matched ? (
                                      k.reasons.map((r, j) => (
                                          <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: j < k.reasons.length - 1 ? 5 : 0 }}>
                                            <span style={{ color: C.green, fontSize: 11, marginTop: 2, flexShrink: 0 }}>→</span>
                                            <p style={{ margin: 0, fontSize: 12, color: C.textSec, lineHeight: 1.55 }}>{r}</p>
                                          </div>
                                      ))
                                  ) : (
                                      <p style={{ margin: 0, fontSize: 12, color: C.textDim }}>
                                        This keyword did not match <strong style={{ color: C.textSec, fontWeight: 600 }}>PO{popup.poIndex}</strong>.
                                      </p>
                                  )}
                                </div>
                              </div>
                          ))}
                        </div>
                    )}

                    {/* Level calculation */}
                    <div style={{ borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                      <div style={{ background: C.elevated, padding: "8px 14px", borderBottom: `1px solid ${C.border}` }}>
                        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.12em" }}>Level calculation</p>
                      </div>
                      <div style={{ padding: "14px 16px", background: C.surface }}>
                        <div style={{ fontFamily: "monospace", fontSize: 12, color: C.textSec, background: C.elevated, borderRadius: 8, padding: "12px 14px", border: `1px solid ${C.border}`, marginBottom: 12, lineHeight: 2.1 }}>
                          <div>
                            Keywords:&nbsp;<strong style={{ color: C.textPri }}>{popup.matchedKeywords.length + popup.unmatchedKeywords.length}</strong>&nbsp;total&nbsp;(
                            <span style={{ color: C.green }}>{popup.matchedKeywords.length} matched</span>,&nbsp;
                            <span style={{ color: C.red }}>{popup.unmatchedKeywords.length} unmatched</span>)
                          </div>
                          <div>
                            Reasons matched (n) =&nbsp;
                            {popup.matchedKeywords.map((k, i) => (
                                <span key={i}>{i > 0 ? " + " : ""}<span style={{ color: C.green }}>{k.count}</span><span style={{ color: C.textDim, fontSize: 11 }}> [{k.keyword}]</span></span>
                            ))}
                            {!popup.matchedKeywords.length && <span style={{ color: C.red }}>0</span>}
                            &nbsp;= <strong style={{ color: C.textPri }}>{popup.totalMatches}</strong>
                          </div>
                          <div>Divisor (d) = <strong style={{ color: C.textPri }}>3</strong></div>
                          <div>Raw score = {popup.totalMatches} ÷ 3 = <strong style={{ color: C.orange }}>{popup.rawScore.toFixed(4)}</strong></div>
                        </div>

                        {/* Score bar */}
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textDim, marginBottom: 5 }}>
                            <span>0.00</span>
                            <span style={{ color: C.l1color }}>0.25 → L1</span>
                            <span style={{ color: C.amber }}>0.50 → L2</span>
                            <span style={{ color: C.orange }}>0.75 → L3</span>
                            <span>1.0+</span>
                          </div>
                          <div style={{ position: "relative", height: 7, background: C.elevated, borderRadius: 4, overflow: "hidden", border: `1px solid ${C.border}` }}>
                            <div style={{ height: "100%", width: `${Math.min(popup.rawScore, 1) * 100}%`, background: s.color, borderRadius: 4, minWidth: popup.rawScore > 0 ? 4 : 0 }} />
                            {[25, 50, 75].map(t => <div key={t} style={{ position: "absolute", top: 0, bottom: 0, left: `${t}%`, width: 1, background: C.borderMid }} />)}
                          </div>
                        </div>

                        {/* Threshold grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
                          {[
                            { label: "score ≥ 0.75", level: 3, desc: "High"   },
                            { label: "score ≥ 0.50", level: 2, desc: "Medium" },
                            { label: "score ≥ 0.25", level: 1, desc: "Low"    },
                            { label: "score < 0.25",  level: 0, desc: "None"  },
                          ].map(t => {
                            const ts = LEVEL_STYLES[t.level];
                            const active = popup.finalLevel === t.level;
                            return (
                                <div key={t.level} style={{ padding: "7px 10px", borderRadius: 7, background: active ? ts.bg : C.elevated, border: `1px solid ${active ? ts.border : C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontSize: 11, color: active ? ts.color : C.textDim, fontFamily: "monospace" }}>{t.label}</span>
                                  <span style={{ fontSize: 11, fontWeight: 600, color: active ? ts.color : C.textDim }}>L{t.level} {t.desc}</span>
                                </div>
                            );
                          })}
                        </div>

                        {/* Final result */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 8, background: s.bg, border: `1px solid ${s.border}` }}>
                          <div>
                            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.1em" }}>Final mapping level — PO{popup.poIndex}</p>
                            <p style={{ margin: "3px 0 0", fontSize: 12, color: s.color }}>
                              {popup.rawScore.toFixed(4)}&nbsp;
                              {popup.finalLevel > 0 ? `≥ ${threshold} → Level ${popup.finalLevel}` : `< 0.25 → no mapping`}
                            </p>
                          </div>
                          <span style={{ fontSize: 30, fontWeight: 700, color: s.color }}>{popup.finalLevel}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          );
        })()}
      </div>
  );
}