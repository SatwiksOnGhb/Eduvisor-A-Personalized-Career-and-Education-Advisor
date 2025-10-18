import { useState, useMemo } from 'react';
import { resourceData } from '../resourceData';

// Helper to return an icon based on resource type
const getTypeIcon = (type) => {
    if (type.toLowerCase().includes('course')) return '🎓';
    if (type.toLowerCase().includes('e-book')) return '📚';
    if (type.toLowerCase().includes('video')) return '🎬';
    return '🔗';
};

export default function Resources() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = useMemo(() => {
        if (!searchTerm) return resourceData;
        const lowercasedFilter = searchTerm.toLowerCase();

        return resourceData.map(category => {
            const filteredItems = category.items.filter(item =>
                item.title.toLowerCase().includes(lowercasedFilter) ||
                item.description.toLowerCase().includes(lowercasedFilter) ||
                item.type.toLowerCase().includes(lowercasedFilter)
            );
            return { ...category, items: filteredItems };
        }).filter(category => category.items.length > 0);

    }, [searchTerm]);

    return (
        <section id="resources">
            <h2>E-Library & Skill Development</h2>
            <div className="resources-header">
                <input
                    type="text"
                    placeholder="Search for courses, e-books, skills..."
                    className="resources-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="resources-grid">
                {filteredData.length > 0 ? filteredData.map(category => (
                    <div key={category.category} className="resource-category">
                        <h3>{category.category}</h3>
                        <div className="resource-cards-container">
                            {category.items.map(item => (
                                <div key={item.title} className="resource-card">
                                    <div className="resource-card-header">
                                        <h4>{getTypeIcon(item.type)} {item.title}</h4>
                                        <span className="resource-type-badge">{item.type}</span>
                                    </div>
                                    <p>{item.description}</p>
                                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="action-btn">
                                        Access Resource
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )) : (
                    <p className="no-resources-found">No resources found matching your search.</p>
                )}
            </div>
        </section>
    );
}
