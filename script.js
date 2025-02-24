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

    // Function to check service status
    async function checkServiceStatus(serviceUrl) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const response = await fetch(`https://${serviceUrl}`, {
                method: 'HEAD', // Only fetch headers
                cache: 'no-cache',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return {
                online: response.ok,
                status: response.status,
                statusText: response.statusText
            };
        } catch (error) {
            console.log(`Service ${serviceUrl} appears to be down:`, error);
            let status = 521; // Default to Cloudflare's "Web Server is down"
            let statusText = 'Web Server Down';

            // Check for specific error types
            if (error.name === 'AbortError') {
                status = 408; // Request Timeout
                statusText = 'Request Timeout';
            } else if (error.message.includes('Failed to fetch')) {
                status = 503; // Service Unavailable
                statusText = 'Service Unavailable';
            } else if (error.message.includes('NetworkError')) {
                status = 502; // Bad Gateway
                statusText = 'Network Error';
            }

            return {
                online: false,
                status: status,
                statusText: statusText
            };
        }
    }

    // Function to update status indicator
    function updateStatusIndicator(element, status) {
        element.classList.remove('status-loading');
        element.classList.add(status.online ? 'status-online' : 'status-offline');
        element.title = status.online ? 'Online' : 'Offline';
    }

    // Check status for all services
    const statusIndicators = document.querySelectorAll('.status-indicator');
    statusIndicators.forEach(async (indicator) => {
        const serviceUrl = indicator.dataset.service;
        const status = await checkServiceStatus(serviceUrl);
        updateStatusIndicator(indicator, status);
    });

    // Periodically check status (every 60 seconds)
    setInterval(() => {
        statusIndicators.forEach(async (indicator) => {
            const serviceUrl = indicator.dataset.service;
            const status = await checkServiceStatus(serviceUrl);
            updateStatusIndicator(indicator, status);
        });
    }, 60000);
});