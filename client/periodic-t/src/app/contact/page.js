"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Contact() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    // Keep it synced with root layout if it changes, but the root layout defaults to dark.
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => (t === "dark" ? "light" : "dark"));
  };

  return (
    <>
      <header className="hdr">
        <div className="hdr-left">
          <Link href="/">
            <img src="/vayl-logo.png" alt="Vayl Logo" style={{ height: "32px", width: "auto", cursor: "pointer" }} />
          </Link>
          <h1 className="hdr-title" style={{ margin: 0, padding: 0 }}>Vayl <span>Contact</span></h1>
        </div>
        <div className="hdr-right">
          <Link href="/" className="btn" style={{ textDecoration: 'none' }}>Home</Link>
          <button className="btn theme-btn btn-icon" onClick={toggleTheme} title="Toggle theme" id="theme-btn">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <div style={{ paddingTop: "100px", paddingBottom: "40px", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r)",
          padding: "40px",
          maxWidth: "500px",
          width: "90%",
          boxShadow: "var(--shadow2)",
          textAlign: "center"
        }}>
          <h1 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "16px", color: "var(--text)", letterSpacing: "-1px" }}>
            Get in Touch
          </h1>
          <p style={{ fontSize: "16px", color: "var(--text2)", lineHeight: "1.6", marginBottom: "32px" }}>
            If you encounter any errors or have any feedback regarding the Vayl Periodic Table, we'd love to hear from you.
          </p>
          
          <div style={{
            background: "var(--surface2)",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            display: "inline-block"
          }}>
            <p style={{ fontSize: "14px", color: "var(--text3)", textTransform: "uppercase", fontWeight: "700", letterSpacing: "1px", marginBottom: "8px" }}>
              Support Email
            </p>
            <a 
              href="mailto:support@vayl.in" 
              style={{ 
                fontSize: "20px", 
                fontWeight: "700", 
                color: "var(--c-transition)", 
                textDecoration: "none",
                fontFamily: "'Space Mono', monospace" 
              }}
            >
              support@vayl.in
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
