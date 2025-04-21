document.addEventListener('DOMContentLoaded', () => {
    const changelogContent = document.getElementById('changelogContent');

    async function loadChangelog() {
        try {
            const response = await fetch('changelog.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const changelogData = await response.json();

            changelogContent.innerHTML = ''; // Clear existing content

            changelogData.forEach(entry => {
                const entryDiv = document.createElement('div');
                entryDiv.className = 'changelog-entry';

                const title = document.createElement('h2');
                title.textContent = `Version ${entry.version}`;

                const date = document.createElement('p');
                date.className = 'changelog-date';
                date.textContent = `Released: ${entry.date}`;

                const list = document.createElement('ul');
                entry.changes.forEach(change => {
                    const listItem = document.createElement('li');
                    listItem.textContent = change;
                    list.appendChild(listItem);
                });

                entryDiv.appendChild(title);
                entryDiv.appendChild(date);
                entryDiv.appendChild(list);
                changelogContent.appendChild(entryDiv);
            });

        } catch (error) {
            console.error('Error loading changelog:', error);
            changelogContent.innerHTML = '<p style="color: var(--text-secondary);">Failed to load changelog.</p>';
        }
    }

    loadChangelog();
});
