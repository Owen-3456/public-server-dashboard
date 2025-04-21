document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('welcomeModal');
    const closeBtn = document.getElementById('closeModal');

    if (!localStorage.getItem('hasVisited')) {
        modal.style.display = 'flex';
        localStorage.setItem('hasVisited', 'true');
    }

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Fetch last commit information from GitHub API
    fetch('https://api.github.com/repos/owen-3456/public-server-dashboard/commits')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const lastCommit = data[0];
            const commitDate = new Date(lastCommit.commit.committer.date);
            const now = new Date();
            const diffMs = now - commitDate;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            let timeString;
            if (diffDays > 7) {
                timeString = commitDate.toLocaleDateString();
            } else if (diffDays > 0) {
                timeString = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            } else if (diffHours > 0) {
                timeString = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            } else {
                timeString = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
            }

            document.getElementById('last-updated').textContent += timeString;
        })
        .catch(error => {
            console.error('Error fetching commit data:', error);
            document.getElementById('last-updated').textContent += 'Error loading update time';
        });

    // Search Bar Functionality
    const searchBar = document.getElementById('searchBar');
    const cards = document.querySelectorAll('.card-grid .card'); // Select only cards within the grid

    searchBar.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();

        cards.forEach(card => {
            const title = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
            const description = card.querySelector('.card-description')?.textContent.toLowerCase() || '';
            const isVisible = title.includes(searchTerm) || description.includes(searchTerm);

            if (isVisible) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });
});