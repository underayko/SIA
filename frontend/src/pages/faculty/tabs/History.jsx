// 📄 SIA/frontend/src/pages/faculty/tabs/History.jsx
// Assigned to: [team member name]
// TODO: build history tab content here

export default function History({ user }) {
    return (
        <div style={{ padding: 0, fontFamily: "sans-serif", color: "#5a6a5e" }}>
            <h2
                style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#134f2c",
                    marginBottom: 8,
                }}
            >
                Ranking Cycle History
            </h2>
            <p>
                All cycles you have participated in or that are currently open
                will be listed here.
            </p>
        </div>
    );
}
