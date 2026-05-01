"use client";
import { Component, ReactNode } from "react";

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message || "Unknown error" };
  }
  componentDidCatch() {}
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", background: "#030712", color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 24 }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <h2 style={{ fontSize: 20, fontWeight: "bold" }}>Something went wrong</h2>
          <p style={{ color: "#9ca3af", fontSize: 14 }}>{this.state.message}</p>
          <button
            onClick={() => { this.setState({ hasError: false, message: "" }); }}
            style={{ background: "#06b6d4", color: "#030712", border: "none", padding: "10px 24px", borderRadius: 12, cursor: "pointer", fontWeight: "bold" }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
