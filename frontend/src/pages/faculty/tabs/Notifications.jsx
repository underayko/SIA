// 📄 SIA/frontend/src/pages/faculty/tabs/Notifications.jsx
// Assigned to: [team member name]
// TODO: build notifications tab content here

export default function Notifications({ user }) {
    return (
        <div style={{ padding: 0, fontFamily: "sans-serif", color: "#5a6a5e" }}>
            <h2
                style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#134f2c",
                    marginBottom: 8,
                }}
            >
                Notifications
            </h2>
            <p>
                System alerts, deadline reminders, and HR / VPAA updates will be
                listed here.
            </p>
        </div>
    );
}
