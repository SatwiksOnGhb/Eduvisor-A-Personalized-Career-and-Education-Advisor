export default function TabNav({ activeTab, onTabClick }) {
    // Added 'resources' to the tabs array
    const tabs = ['quiz', 'courses', 'colleges', 'timeline', 'resources'];
    const tabLabels = {
        quiz: '🧠 Aptitude Quiz',
        courses: '🗺️ Career Paths',
        colleges: '🏫 Nearby Colleges',
        timeline: '🗓️ Timeline Tracker',
        // Added the label for the new tab
        resources: '📚 E-Library & Skills',
    };

    return (
        <nav className="tab-nav">
            {tabs.map(tabId => (
                <button
                    key={tabId}
                    className={`tab-btn ${activeTab === tabId ? 'active' : ''}`}
                    onClick={() => onTabClick(tabId)}
                >
                    {tabLabels[tabId]}
                </button>
            ))}
        </nav>
    );
}
