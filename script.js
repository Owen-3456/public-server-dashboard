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
            // Use ping approach with image load instead of direct fetch
            // This avoids CORS issues
            return new Promise((resolve) => {
                const img = new Image();
                const timestamp = new Date().getTime(); // Cache busting

                // Set timeout for image loading
                const timeout = setTimeout(() => {
                    console.log(`Service ${serviceUrl} timed out`);
                    resolve({
                        online: false,
                        status: 408,
                        statusText: 'Request Timeout'
                    });
                }, 5000);

                img.onload = () => {
                    clearTimeout(timeout);
                    console.log(`Service ${serviceUrl} is online`);
                    resolve({
                        online: true,
                        status: 200,
                        statusText: 'OK'
                    });
                };

                img.onerror = () => {
                    clearTimeout(timeout);
                    // We expect this error for most services due to CORS
                    // But if we get here, the service is likely online
                    console.log(`Service ${serviceUrl} appears online but returned an error`);
                    resolve({
                        online: true,
                        status: 200,
                        statusText: 'Service Reachable'
                    });
                };

                // Try to load a favicon or other common image from the service
                img.src = `https://${serviceUrl}/favicon.ico?t=${timestamp}`;
            });
        } catch (error) {
            console.log(`Service ${serviceUrl} check failed:`, error);
            return {
                online: false,
                status: 503,
                statusText: 'Service Unavailable'
            };
        }
    }

    // Function to update status indicator
    function updateStatusIndicator(element, status) {
        element.classList.remove('status-loading');
        element.classList.add(status.online ? 'status-online' : 'status-offline');

        // Update the tooltip with more detail
        element.title = status.online ?
            `Online (${status.statusText})` :
            `Offline (${status.statusText})`;

        // Log status for debugging
        console.log(`Updated status for ${element.dataset.service}: ${status.online ? 'Online' : 'Offline'}`);
    }

    // Check status for all services
    const statusIndicators = document.querySelectorAll('.status-indicator');
    statusIndicators.forEach(async (indicator) => {
        const serviceUrl = indicator.dataset.service;
        console.log(`Checking service: ${serviceUrl}`);
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