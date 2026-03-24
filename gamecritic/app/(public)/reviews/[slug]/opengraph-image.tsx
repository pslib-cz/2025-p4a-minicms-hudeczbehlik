import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0f172a, #0369a1)",
          color: "white",
          fontSize: 64,
          fontWeight: 800,
          letterSpacing: "-0.02em",
        }}
      >
        <div>GameCritic</div>
        <div style={{ fontSize: 34, fontWeight: 500, marginTop: 16 }}>
          Community-powered reviews
        </div>
      </div>
    ),
    size,
  );
}
