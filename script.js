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

    const cardGrid = document.getElementById('cardGrid');
    const searchBar = document.getElementById('searchBar');
    const tagFiltersContainer = document.getElementById('tagFilters');
    let allServices = []; // Store all services fetched
    let currentFilterTag = 'All'; // Track the currently selected tag

    // Function to create a service card element
    function createServiceCard(service) {
        const card = document.createElement('div');
        card.className = 'card';
        // Store tags on the element for filtering
        card.dataset.tags = service.tags ? service.tags.join(',') : '';

        if (service.available !== false) {
            card.classList.add('available');
            card.onclick = () => window.open(service.url, '_blank', 'noopener noreferrer');
            card.style.cursor = 'pointer';
        } else {
            card.classList.add('unavailable');
            card.title = `${service.name} is currently unavailable`;
        }

        card.innerHTML = `
            <div class="card-icon">
                <img src="${service.iconUrl}" alt="${service.altText}" />
            </div>
            <div class="card-title">${service.name}</div>
            <div class="card-description">${service.description}</div>
        `;
        return card;
    }

    // Function to filter and display services based on search term and tag
    function filterAndDisplayServices() {
        const searchTerm = searchBar.value.toLowerCase();
        const cards = cardGrid.querySelectorAll('.card');

        cards.forEach(card => {
            const title = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
            const description = card.querySelector('.card-description')?.textContent.toLowerCase() || '';
            const tags = card.dataset.tags.split(',');

            const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
            const matchesTag = currentFilterTag === 'All' || tags.includes(currentFilterTag);

            if (matchesSearch && matchesTag) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    }

    // Function to create tag filter buttons
    function createTagFilters(services) {
        const tags = new Set();
        services.forEach(service => {
            if (service.tags) {
                service.tags.forEach(tag => tags.add(tag));
            }
        });

        tagFiltersContainer.innerHTML = ''; // Clear existing buttons

        // Add 'All' button
        const allButton = document.createElement('button');
        allButton.textContent = 'All';
        allButton.className = 'tag-button active'; // Active by default
        allButton.addEventListener('click', () => setFilterTag('All'));
        tagFiltersContainer.appendChild(allButton);

        // Add buttons for each unique tag
        tags.forEach(tag => {
            const button = document.createElement('button');
            button.textContent = tag;
            button.className = 'tag-button';
            button.addEventListener('click', () => setFilterTag(tag));
            tagFiltersContainer.appendChild(button);
        });
    }

    // Function to set the active filter tag and update display
    function setFilterTag(tag) {
        currentFilterTag = tag;
        // Update active class on buttons
        const buttons = tagFiltersContainer.querySelectorAll('.tag-button');
        buttons.forEach(button => {
            if (button.textContent === tag) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        filterAndDisplayServices(); // Re-filter cards
    }

    // Function to load and display services
    async function loadServices() {
        try {
            const response = await fetch('services.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allServices = await response.json(); // Store services
            cardGrid.innerHTML = ''; // Clear existing cards

            allServices.forEach(service => {
                const cardElement = createServiceCard(service);
                cardGrid.appendChild(cardElement);
            });

            createTagFilters(allServices); // Create tag filters
            initializeSearch(); // Initialize search after cards are loaded
            filterAndDisplayServices(); // Initial display based on default filters

        } catch (error) {
            console.error('Error loading services:', error);
            cardGrid.innerHTML = '<p style="color: var(--text-secondary);">Failed to load services.</p>';
        }
    }

    // Search Bar Functionality
    function initializeSearch() {
        searchBar.addEventListener('input', filterAndDisplayServices);
    }

    // Initial load of services
    loadServices();

});