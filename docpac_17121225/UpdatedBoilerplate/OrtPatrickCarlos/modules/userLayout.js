// Main function - gets all layout data for a page
function getLayoutData(user, pageTitle = '') {
    return {
        user: formatUserForTemplate(user),
        isLoggedIn: isUserLoggedIn(user),
        displayName: getDisplayName(user),
        navigation: getNavigationLinks(user),
        pageTitle: pageTitle
    };
}

// Helper functions
function formatUserForTemplate(user) {
    // Handle null/undefined user
    if (!user) {
        return null; // or return {}
    }
    
    // Create clean user object for templates
    const formattedUser = {
        id: user.id,
        username: user.username,

    };
    
    return formattedUser;
}


function isUserLoggedIn(user) {
    // Handle null/undefined
    if (!user) {
        return false;
    }
    
    // Check if user has a valid ID
    if (!user.id || typeof user.id !== 'number') {
        return false;
    }
    
    return true;
}


async function getDisplayName(user) {
    if (!isUserLoggedIn(user)) {
        return 'Guest';
    }
    
    try {
        // Query: SELECT username FROM users WHERE id = ?
        // Return the username
        const username = await queryDatabaseForUsername(user.id); // Placeholder function
        return username;
    } catch (error) {
        // Handle error - return fallback
        return `User ${user.id}`;
    }
}


function getNavigationLinks(user) {
    const isLoggedIn = isUserLoggedIn(user);
    
    if (isLoggedIn) {
        // Return links for logged-in users
        return [
            { text: 'Home', url: '/' },
            { text: 'Profile', url: '/profile' },
            { text: 'Logout', url: '/logout' }
        ];
    } else {
        // Return links for guests
        return [
            { text: 'Home', url: '/' },
            { text: 'Login', url: '/login' }
        ];
    }
}

module.exports = {
    getLayoutData,
    formatUserForTemplate,
    isUserLoggedIn,
    getDisplayName,
    getNavigationLinks
};
