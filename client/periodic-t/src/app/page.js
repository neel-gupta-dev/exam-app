"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ELEMENTS, CATS } from "../data/elements";
import ELECTRON_SHELLS from "../data/electronShells";

export default function PeriodicTable() {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [theme, setTheme] = useState("dark");
  const [selectedElement, setSelectedElement] = useState(null);

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

  // Build legend items
  const legendItems = Object.entries(CATS).map(([key, cat]) => (
    <div key={key} className="legend-item">
      <div className="legend-dot" style={{ backgroundColor: cat.color }}></div>
      <span>{cat.label}</span>
    </div>
  ));

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
                const style = {
                  gridColumn: el.col,
                  gridRow: el.row,
                  "--cat-color": cat.color,
                  "--cat-bg": cat.bg,
                  "--cat-color-dim": cat.glow,
                };

                return (
                  <div
                    key={el.n}
                    className="el"
                    style={style}
                    onClick={() => setSelectedElement(el)}
                    title={el.name}
                  >
                    <div className="el-num">{el.n}</div>
                    <div className="el-sym">{el.sym}</div>
                    <div className="el-name">{el.name}</div>
                    <div className="el-mass">{el.mass}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="legend">{legendItems}</div>
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
                  // Base size for innermost orbit; each subsequent one grows
                  const baseSize = 80;
                  const step = 32;
                  return shells.slice(0, maxShells).map((electronCount, shellIndex) => {
                    const size = baseSize + shellIndex * step;
                    // Alternate rotation direction, and slow down outer shells
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
                          // Evenly distribute electrons around the orbit
                          const angle = (360 / electronCount) * eIdx;
                          const radius = size / 2;
                          return (
                            <div
                              key={eIdx}
                              className="electron"
                              style={{
                                backgroundColor: catColor,
                                boxShadow: `0 0 6px ${catColor}`,
                                // Position each electron at the right angle on the circle
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
                <div className="detail-cat-badge" style={{ 
                  backgroundColor: CATS[selectedElement.cat]?.bg || '#333', 
                  color: CATS[selectedElement.cat]?.color || '#fff' 
                }}>
                  {CATS[selectedElement.cat]?.label || 'Unknown'}
                </div>
                <div className="detail-name">{selectedElement.name}</div>
                <div className="detail-mass-line">Atomic Mass: {selectedElement.mass} u</div>
                <div className="detail-desc">{selectedElement.desc}</div>
              </div>
            </div>

            <div className="detail-body">
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
            </div>
          </div>
        )}
      </div>
    </>
  );
}
