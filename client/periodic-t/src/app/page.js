"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { ELEMENTS, CATS } from "../data/elements";
import ELECTRON_SHELLS from "../data/electronShells";
import OXIDATION_STATES from "../data/oxidationStates";
import ISOTOPES from "../data/isotopes";
import BLOCKS, { BLOCK_INFO } from "../data/blocks";

// Parse electron config string like "[Ne] 3s²3p⁵" into orbital entries
function parseElectronConfig(configStr) {
  if (!configStr) return [];
  const superscriptMap = { '⁰':0,'¹':1,'²':2,'³':3,'⁴':4,'⁵':5,'⁶':6,'⁷':7,'⁸':8,'⁹':9 };
  // Remove noble gas core notation for display but keep it
  const coreMatch = configStr.match(/^\[([A-Za-z]+)\]\s*/);
  const core = coreMatch ? coreMatch[1] : null;
  const rest = coreMatch ? configStr.slice(coreMatch[0].length) : configStr;
  
  const orbitals = [];
  // Match patterns like 1s², 2p⁶, 4f¹⁴
  const regex = /(\d)([spdf])([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g;
  let match;
  while ((match = regex.exec(rest)) !== null) {
    const n = parseInt(match[1]);
    const type = match[2];
    const supDigits = match[3];
    let count = 0;
    for (const ch of supDigits) {
      count = count * 10 + (superscriptMap[ch] ?? 0);
    }
    orbitals.push({ n, type, count });
  }
  return { core, orbitals };
}

// Max electrons per orbital type
const ORBITAL_MAX = { s: 2, p: 6, d: 10, f: 14 };

// Shell label names
const SHELL_NAMES = ['K','L','M','N','O','P','Q'];

export default function PeriodicTable() {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [theme, setTheme] = useState("dark");
  const [selectedElement, setSelectedElement] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(null);
  const [activeTrend, setActiveTrend] = useState("none");
  const [compareMode, setCompareMode] = useState(false);
  const [compareList, setCompareList] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => (t === "dark" ? "light" : "dark"));
  };

  const handleZoom = (dir) => {
    if (dir === 0) {
      setZoomLevel(1);
    } else {
      setZoomLevel(z => Math.max(0.5, Math.min(2, z + dir * 0.1)));
    }
  };

  // Search + filter logic
  const matchesSearch = useCallback((el) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      el.name.toLowerCase().includes(q) ||
      el.sym.toLowerCase().includes(q) ||
      String(el.n).includes(q)
    );
  }, [searchQuery]);

  const matchesFilter = useCallback((el) => {
    if (!activeFilter) return true;
    return el.cat === activeFilter;
  }, [activeFilter]);

  const isHighlighted = useCallback((el) => {
    return matchesSearch(el) && matchesFilter(el);
  }, [matchesSearch, matchesFilter]);

  const hasActiveFilters = searchQuery || activeFilter;

  // Compare mode handlers
  const toggleCompare = (el) => {
    setCompareList(prev => {
      const exists = prev.find(e => e.n === el.n);
      if (exists) return prev.filter(e => e.n !== el.n);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, el];
    });
  };

  const handleElementClick = (el) => {
    if (compareMode) {
      toggleCompare(el);
    } else {
      setSelectedElement(el);
    }
  };

  const exitCompare = () => {
    setCompareMode(false);
    setCompareList([]);
  };

  // Build legend items (also act as filter buttons)
  const legendItems = Object.entries(CATS).map(([key, cat]) => (
    <div 
      key={key} 
      className={`legend-item ${activeFilter === key ? 'legend-active' : ''}`}
      onClick={() => setActiveFilter(activeFilter === key ? null : key)}
    >
      <div className="legend-dot" style={{ backgroundColor: cat.color }}></div>
      <span>{cat.label}</span>
    </div>
  ));

  // --- Trend Logic ---
  const trendMaxValues = useMemo(() => {
    let maxEn = 0, maxMass = 0, maxMelt = 0, maxBoil = 0, maxDensity = 0;
    ELEMENTS.forEach(el => {
      if (el.en > maxEn) maxEn = el.en;
      if (el.mass > maxMass) maxMass = el.mass;
      if (el.melt > maxMelt) maxMelt = el.melt;
      if (el.boil > maxBoil) maxBoil = el.boil;
      if (el.density > maxDensity) maxDensity = el.density;
    });
    return { en: maxEn, mass: maxMass, melt: maxMelt, boil: maxBoil, density: maxDensity };
  }, []);

  const getTrendStyle = useCallback((el) => {
    if (activeTrend === "none") return null;

    if (activeTrend === "block") {
      const blockLetter = BLOCKS[el.n];
      if (!blockLetter) return { "--cat-bg": "rgba(100,100,100,0.1)", "--cat-color": "#555" };
      const info = BLOCK_INFO[blockLetter];
      return {
        "--cat-bg": info.bg,
        "--cat-color": info.color
      };
    }

    let val = 0, max = 1;
    if (activeTrend === "en") { val = el.en || 0; max = trendMaxValues.en; }
    if (activeTrend === "mass") { val = el.mass || 0; max = trendMaxValues.mass; }
    if (activeTrend === "melt") { val = el.melt || 0; max = trendMaxValues.melt; }
    if (activeTrend === "boil") { val = el.boil || 0; max = trendMaxValues.boil; }
    if (activeTrend === "density") { val = el.density || 0; max = trendMaxValues.density; }

    // Calculate a heatmap color (e.g. from cool blue to hot red)
    if (val === 0) return { "--cat-bg": "rgba(100,100,100,0.1)", "--cat-color": "#555" };
    
    // val/max goes from 0 to 1
    // Hue: 240 (blue) down to 0 (red)
    const ratio = val / max;
    const hue = Math.max(0, 240 - (ratio * 240)); 
    
    let trendStyle = {
      "--cat-bg": `hsla(${hue}, 85%, 55%, 0.25)`,
      "--cat-color": `hsl(${hue}, 85%, 55%)`
    };

    if (activeTrend === "density") {
      // Normal hover is 1.15. Heavy elements pop less (down to ~1.02)
      const hoverScale = 1.15 - (ratio * 0.13); 
      // Normal Y translate is -3px. Heavy elements move less (down to ~-0.5px)
      const hoverY = -3 + (ratio * 2.5);
      
      trendStyle["--hover-scale"] = hoverScale.toFixed(3);
      trendStyle["--hover-y"] = `${hoverY.toFixed(1)}px`;
    }

    return trendStyle;
  }, [activeTrend, trendMaxValues]);


  return (
    <>
      <header className="hdr">
        <div className="hdr-left">
          <img src="/vayl-logo.png" alt="Vayl Logo" style={{ height: "32px", width: "auto" }} />
          <h1 className="hdr-title" style={{ margin: 0, padding: 0 }}>Vayl <span>Periodic Table</span></h1>
        </div>
        <div className="hdr-right">
          <Link href="/contact" className="btn" style={{ textDecoration: 'none' }}>Contact</Link>
          <div className="zoom-group">
            <button className="btn btn-icon" onClick={() => handleZoom(-1)} title="Zoom out">−</button>
            <span className="zoom-val" id="zoom-val">{Math.round(zoomLevel * 100)}%</span>
            <button className="btn btn-icon" onClick={() => handleZoom(1)} title="Zoom in">+</button>
          </div>
          <button className="btn" onClick={() => handleZoom(0)}>Reset</button>
          <button className="btn theme-btn btn-icon" onClick={toggleTheme} title="Toggle theme" id="theme-btn">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <div id="table-view" className={selectedElement ? "hide" : ""}>
        {/* Search & Filter & Trend Bar */}
        <div className="search-bar">
          <div className="search-input-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, symbol, or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="search-input"
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery("")}>✕</button>
            )}
          </div>
          
          <select 
            className="trend-select" 
            value={activeTrend} 
            onChange={(e) => setActiveTrend(e.target.value)}
            title="View Periodic Trends"
          >
            <option value="none">Standard View</option>
            <option value="block">🏗️ Color by Block (s,p,d,f)</option>
            <option value="en">🔥 Electronegativity</option>
            <option value="mass">⚖️ Atomic Mass</option>
            <option value="melt">🌡️ Melting Point</option>
            <option value="boil">💨 Boiling Point</option>
            <option value="density">🧱 Density</option>
          </select>

          <button 
            className={`btn compare-btn ${compareMode ? 'compare-active' : ''}`}
            onClick={() => compareMode ? exitCompare() : setCompareMode(true)}
          >
            {compareMode ? `✕ Exit Compare (${compareList.length}/3)` : '⚖️ Compare'}
          </button>
        </div>

        <div className="table-wrap">
          <div className="table-scaler" style={{ transform: `scale(${zoomLevel})` }}>
            <div className="pt-grid">
              {/* Gap between main table and inner transition metals */}
              <div className="pt-separator" style={{ gridRow: 8 }}></div>
              
              {/* Lanthanide / Actinide labels */}
              <div className="pt-label" style={{ gridRow: 9 }}>Lanthanides</div>
              <div className="pt-label" style={{ gridRow: 10 }}>Actinides</div>

              {ELEMENTS.map((el) => {
                const cat = CATS[el.cat] || CATS.unknown;
                const highlighted = isHighlighted(el);
                const isCompared = compareList.find(e => e.n === el.n);
                
                // Base style vs Trend style
                let style = { gridColumn: el.col, gridRow: el.row };
                const trendStyle = getTrendStyle(el);
                if (trendStyle) {
                  style = { ...style, ...trendStyle };
                } else {
                  style = {
                    ...style,
                    "--cat-color": cat.color,
                    "--cat-bg": cat.bg,
                    "--cat-color-dim": cat.glow,
                  };
                }

                // If trend is active, show the trend value instead of mass
                let valStr = el.mass;
                if (activeTrend === "block") {
                  const b = BLOCKS[el.n];
                  valStr = b ? `${b}-block` : "-";
                }
                if (activeTrend === "en") valStr = el.en || "-";
                if (activeTrend === "melt") valStr = el.melt ? `${el.melt}K` : "-";
                if (activeTrend === "boil") valStr = el.boil ? `${el.boil}K` : "-";
                if (activeTrend === "density") valStr = el.density ? `${el.density}` : "-";

                return (
                  <div
                    key={el.n}
                    className={`el ${hasActiveFilters && !highlighted ? 'el-dimmed' : ''} ${isCompared ? 'el-compared' : ''}`}
                    style={style}
                    onClick={() => handleElementClick(el)}
                    title={el.name}
                  >
                    <div className="el-num">{el.n}</div>
                    <div className="el-sym">{el.sym}</div>
                    <div className="el-name">{el.name}</div>
                    <div className="el-mass">{valStr}</div>
                    {isCompared && <div className="el-check">✓</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="legend">{legendItems}</div>

        {/* Compare Panel */}
        {compareMode && compareList.length >= 2 && (
          <div className="compare-panel">
            <div className="compare-header">
              <h2 className="compare-title">⚖️ Element Comparison</h2>
              <button className="btn" onClick={exitCompare}>Close</button>
            </div>
            <div className="compare-table-wrap">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    {compareList.map(el => (
                      <th key={el.n} style={{ color: CATS[el.cat]?.color }}>
                        <span className="compare-sym">{el.sym}</span>
                        <span className="compare-name">{el.name}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Atomic Number</td>
                    {compareList.map(el => <td key={el.n}>{el.n}</td>)}
                  </tr>
                  <tr>
                    <td>Atomic Mass</td>
                    {compareList.map(el => <td key={el.n}>{el.mass} u</td>)}
                  </tr>
                  <tr>
                    <td>Category</td>
                    {compareList.map(el => (
                      <td key={el.n}>
                        <span className="compare-cat-badge" style={{ backgroundColor: CATS[el.cat]?.bg, color: CATS[el.cat]?.color }}>
                          {CATS[el.cat]?.label}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Block</td>
                    {compareList.map(el => (
                      <td key={el.n}>
                        {BLOCKS[el.n] ? (
                          <span className="compare-cat-badge" style={{ backgroundColor: BLOCK_INFO[BLOCKS[el.n]]?.bg, color: BLOCK_INFO[BLOCKS[el.n]]?.color }}>
                            {BLOCK_INFO[BLOCKS[el.n]]?.label}
                          </span>
                        ) : "N/A"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>State (20°C)</td>
                    {compareList.map(el => <td key={el.n} className="capitalize">{el.state}</td>)}
                  </tr>
                  <tr>
                    <td>Electronegativity</td>
                    {compareList.map(el => <td key={el.n}>{el.en || "N/A"}</td>)}
                  </tr>
                  <tr>
                    <td>Oxidation States</td>
                    {compareList.map(el => (
                      <td key={el.n}>
                        {OXIDATION_STATES[el.n] ? (
                          <span style={{ fontSize: '12px' }}>
                            {OXIDATION_STATES[el.n].map(o => (o > 0 ? `+${o}` : o)).join(", ")}
                          </span>
                        ) : "N/A"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Melting Point</td>
                    {compareList.map(el => <td key={el.n}>{el.melt ? `${el.melt} K` : "N/A"}</td>)}
                  </tr>
                  <tr>
                    <td>Boiling Point</td>
                    {compareList.map(el => <td key={el.n}>{el.boil ? `${el.boil} K` : "N/A"}</td>)}
                  </tr>
                  <tr>
                    <td>Density</td>
                    {compareList.map(el => <td key={el.n}>{el.density ? `${el.density} g/cm³` : "N/A"}</td>)}
                  </tr>
                  <tr>
                    <td>Electron Config</td>
                    {compareList.map(el => <td key={el.n} className="mono">{el.config}</td>)}
                  </tr>
                  <tr>
                    <td>Electron Shells</td>
                    {compareList.map(el => (
                      <td key={el.n} className="mono">
                        {(ELECTRON_SHELLS[el.n] || []).join(' · ')}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Year Discovered</td>
                    {compareList.map(el => <td key={el.n}>{el.year || "Antiquity"}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div id="detail-view" className={selectedElement ? "show" : ""}>
        {selectedElement && (
          <div className="detail-wrap">
            <button className="detail-back" onClick={() => setSelectedElement(null)}>
              ← Back to Table
            </button>
            <div className="detail-hero">
              <div className="detail-bg-sym" style={{ color: CATS[selectedElement.cat]?.color || '#888' }}>
                {selectedElement.sym}
              </div>
              
              <div className="detail-atom">
                <div className="atom-core" style={{ 
                  backgroundColor: CATS[selectedElement.cat]?.color || '#888',
                  boxShadow: `0 0 0 6px ${CATS[selectedElement.cat]?.bg || 'rgba(0,0,0,0.1)'}, 0 0 30px ${CATS[selectedElement.cat]?.glow || 'rgba(0,0,0,0.2)'}`
                }}>
                  <div className="atom-sym">{selectedElement.sym}</div>
                  <div className="atom-num">{selectedElement.n}</div>
                </div>
                {(() => {
                  const shells = ELECTRON_SHELLS[selectedElement.n] || [];
                  const catColor = CATS[selectedElement.cat]?.color || '#888';
                  const maxShells = Math.min(shells.length, 7);
                  const baseSize = 80;
                  const step = 32;
                  return shells.slice(0, maxShells).map((electronCount, shellIndex) => {
                    const size = baseSize + shellIndex * step;
                    const duration = 3 + shellIndex * 2;
                    const direction = shellIndex % 2 === 0 ? 'normal' : 'reverse';
                    return (
                      <div
                        key={shellIndex}
                        className="orbit"
                        style={{
                          width: size,
                          height: size,
                          borderColor: catColor,
                          animation: `spin ${duration}s linear infinite ${direction}`,
                        }}
                      >
                        {Array.from({ length: electronCount }).map((_, eIdx) => {
                          const angle = (360 / electronCount) * eIdx;
                          const radius = size / 2;
                          return (
                            <div
                              key={eIdx}
                              className="electron"
                              style={{
                                backgroundColor: catColor,
                                boxShadow: `0 0 6px ${catColor}`,
                                top: '50%',
                                left: '50%',
                                transform: `rotate(${angle}deg) translateY(-${radius}px) translate(-50%, -50%)`,
                                transformOrigin: '0 0',
                              }}
                            />
                          );
                        })}
                      </div>
                    );
                  });
                })()}
              </div>

              <div className="detail-info">
                <div className="badge-row" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <div className="detail-cat-badge" style={{ 
                    backgroundColor: CATS[selectedElement.cat]?.bg || '#333', 
                    color: CATS[selectedElement.cat]?.color || '#fff',
                    margin: 0
                  }}>
                    {CATS[selectedElement.cat]?.label || 'Unknown'}
                  </div>
                  {BLOCKS[selectedElement.n] && (
                    <div className="detail-cat-badge" style={{ 
                      backgroundColor: BLOCK_INFO[BLOCKS[selectedElement.n]]?.bg, 
                      color: BLOCK_INFO[BLOCKS[selectedElement.n]]?.color,
                      margin: 0
                    }}>
                      {BLOCK_INFO[BLOCKS[selectedElement.n]]?.label}
                    </div>
                  )}
                </div>
                <div className="detail-name">{selectedElement.name}</div>
                <div className="detail-mass-line">Atomic Mass: {selectedElement.mass} u</div>
                
                {/* Oxidation States Quick View */}
                {OXIDATION_STATES[selectedElement.n] && (
                  <div className="detail-ox-line" style={{ marginTop: '6px', fontSize: '13px', color: 'var(--text2)' }}>
                    <strong style={{ color: 'var(--text)' }}>Oxidation States:</strong> {
                      OXIDATION_STATES[selectedElement.n].map((ox, i) => (
                        <span key={i} style={{ 
                          fontWeight: i === 0 ? '700' : '400',
                          color: i === 0 ? 'var(--text)' : 'inherit'
                        }}>
                          {ox > 0 ? `+${ox}` : ox}{i < OXIDATION_STATES[selectedElement.n].length - 1 ? ', ' : ''}
                        </span>
                      ))
                    }
                  </div>
                )}
                
                <div className="detail-desc">{selectedElement.desc}</div>
              </div>
            </div>

            <div className="detail-body">
              {/* Electron Configuration Section */}
              <div className="detail-section">
                <div className="detail-section-title">Electron Configuration</div>
                <div className="config-box">
                  <div className="config-text">{selectedElement.config}</div>
                </div>
                
                {/* Orbital Diagram */}
                {(() => {
                  const parsed = parseElectronConfig(selectedElement.config);
                  if (!parsed.orbitals || parsed.orbitals.length === 0) return null;
                  return (
                    <div className="orbital-diagram">
                      {parsed.core && (
                        <div className="orbital-core-badge">[{parsed.core}]</div>
                      )}
                      {parsed.orbitals.map((orb, i) => {
                        const max = ORBITAL_MAX[orb.type] || orb.count;
                        return (
                          <div key={i} className="orbital-group">
                            <div className="orbital-label">{orb.n}{orb.type}</div>
                            <div className="orbital-boxes">
                              {Array.from({ length: max }).map((_, j) => {
                                const filled = j < orb.count;
                                // For pairs: first arrow up, second arrow down
                                const isUp = j % 2 === 0 && filled;
                                const isDown = j % 2 === 1 && filled;
                                // For s orbital, show paired in one box
                                // For others, show individual boxes
                                return (
                                  <div key={j} className={`orbital-box ${filled ? 'orbital-filled' : 'orbital-empty'}`}
                                    style={{ '--cat-color': CATS[selectedElement.cat]?.color || '#888' }}
                                  >
                                    {filled && (
                                      <span className="orbital-arrow">{j % 2 === 0 ? '↑' : '↓'}</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Shell Distribution */}
                {ELECTRON_SHELLS[selectedElement.n] && (
                  <div className="shells-row">
                    {ELECTRON_SHELLS[selectedElement.n].map((count, i) => (
                      <div key={i} className="shell-badge">
                        <div className="shell-label">{SHELL_NAMES[i] || `S${i+1}`}</div>
                        <div className="shell-count" style={{ 
                          '--cat-color': CATS[selectedElement.cat]?.color,
                          '--cat-bg': CATS[selectedElement.cat]?.bg,
                          borderColor: CATS[selectedElement.cat]?.color,
                          backgroundColor: CATS[selectedElement.cat]?.bg,
                          color: CATS[selectedElement.cat]?.color,
                        }}>
                          {count}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="detail-section">
                <div className="detail-section-title">Properties</div>
                <div className="props-grid">
                  <div className="prop-card">
                    <div className="prop-label">State at 20°C</div>
                    <div className="prop-val state-badge state-solid">{selectedElement.state}</div>
                  </div>
                  <div className="prop-card">
                    <div className="prop-label">Melting Point</div>
                    <div className="prop-val">{selectedElement.melt || "N/A"} <span className="prop-unit">{selectedElement.melt ? "K" : ""}</span></div>
                  </div>
                  <div className="prop-card">
                    <div className="prop-label">Boiling Point</div>
                    <div className="prop-val">{selectedElement.boil || "N/A"} <span className="prop-unit">{selectedElement.boil ? "K" : ""}</span></div>
                  </div>
                  <div className="prop-card">
                    <div className="prop-label">Density</div>
                    <div className="prop-val">{selectedElement.density || "N/A"} <span className="prop-unit">{selectedElement.density ? "g/cm³" : ""}</span></div>
                  </div>
                  <div className="prop-card">
                    <div className="prop-label">Electronegativity</div>
                    <div className="prop-val">{selectedElement.en || "N/A"}</div>
                  </div>
                </div>
              </div>
              
              <div className="detail-section">
                <div className="detail-section-title">Discovery</div>
                <div className="discovery-box">
                  <div className="disc-item">
                    <div className="disc-item-label">Year</div>
                    <div className="disc-item-val">{selectedElement.year || "Antiquity"}</div>
                  </div>
                  <div className="disc-item">
                    <div className="disc-item-label">Discoverer</div>
                    <div className="disc-item-val">{selectedElement.by || "Unknown"}</div>
                  </div>
                </div>
              </div>

              {/* Isotopes Section */}
              {ISOTOPES[selectedElement.n] && ISOTOPES[selectedElement.n].length > 0 && (
                <div className="detail-section">
                  <div className="detail-section-title">Notable Isotopes</div>
                  <div className="isotopes-table-wrap" style={{ 
                    background: 'var(--surface)', 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--r)',
                    overflow: 'hidden'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                      <thead style={{ background: 'var(--surface2)' }}>
                        <tr>
                          <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>Isotope</th>
                          <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>Abundance / t½</th>
                          <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ISOTOPES[selectedElement.n].map((iso, idx) => (
                          <tr key={idx} style={{ borderBottom: idx === ISOTOPES[selectedElement.n].length - 1 ? 'none' : '1px solid var(--border)' }}>
                            <td style={{ padding: '10px 16px', fontWeight: '700', color: 'var(--text)' }}>
                              <sup>{iso.mass}</sup>{selectedElement.sym}
                            </td>
                            <td style={{ padding: '10px 16px', fontFamily: "'Space Mono', monospace", fontSize: '12px' }}>
                              {iso.abundance}
                            </td>
                            <td style={{ padding: '10px 16px', color: 'var(--text3)' }}>
                              {!iso.stable && <span style={{ color: 'var(--c-lanthanide)', fontWeight: '700', marginRight: '6px' }} title="Radioactive">☢️</span>}
                              {iso.notable || (iso.stable ? 'Stable' : 'Radioactive')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
