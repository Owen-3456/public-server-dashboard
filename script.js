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

    // Function to create a service card element
    function createServiceCard(service) {
        const card = document.createElement('a');
        card.className = 'card';
        card.href = service.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';

        card.innerHTML = `
            <div class="card-icon">
                <img src="${service.iconUrl}" alt="${service.altText}" />
            </div>
            <div class="card-title">${service.name}</div>
            <div class="card-description">${service.description}</div>
        `;
        return card;
    }

    // Function to load and display services
    async function loadServices() {
        try {
            const response = await fetch('services.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const services = await response.json();
            const cardGrid = document.getElementById('cardGrid');
            cardGrid.innerHTML = ''; // Clear existing cards (if any)

            services.forEach(service => {
                const cardElement = createServiceCard(service);
                cardGrid.appendChild(cardElement);
            });

            // Re-initialize search functionality after cards are loaded
            initializeSearch();

        } catch (error) {
            console.error('Error loading services:', error);
            const cardGrid = document.getElementById('cardGrid');
            cardGrid.innerHTML = '<p style="color: var(--text-secondary);">Failed to load services.</p>';
        }
    }

    // Search Bar Functionality (modified to be callable)
    function initializeSearch() {
        const searchBar = document.getElementById('searchBar');
        const cardGrid = document.getElementById('cardGrid'); // Get the grid container

        searchBar.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const cards = cardGrid.querySelectorAll('.card'); // Select cards within the grid

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
    }

    // Initial load of services
    loadServices();

});