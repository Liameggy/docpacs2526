class UserLayout {
    constructor(logger) {
        this.logger = logger;
        this.defaultNavigation = [
            { name: 'Home', path: '/', icon: '🏠' },
            { name: 'Socket.IO Magic', path: '/sockets', icon: '✨' }
        ];
    }

    // Convert user object into EJS template-friendly format
    formatUserForTemplate(user, session = null) {
        if (!user) {
            return this.getGuestUserData();
        }

        return {
            // Basic user info
            id: user.id,
            username: user.username,
            displayName: user.displayName || user.username,
            email: user.email,
            formbarId: user.formbarId || user.formbarID,
            
            // Authentication status
            isLoggedIn: true,
            isAuthenticated: true,
            
            // User preferences (with defaults)
            preferences: {
                theme: user.theme || 'light',
                language: user.language || 'en',
                timezone: user.timezone || 'UTC',
                notifications: user.notifications !== false // default true
            },
            
            // Display formatting
            initials: this.getUserInitials(user.displayName || user.username),
            avatarColor: this.generateAvatarColor(user.id),
            memberSince: user.createdAt ? this.formatDate(user.createdAt) : 'Recently',
            
            // Session info
            sessionId: session?.id,
            sessionData: session || {}
        };
    }

    // Get guest user data for non-authenticated users
    getGuestUserData() {
        return {
            id: null,
            username: 'Guest',
            displayName: 'Guest User',
            email: null,
            formbarId: null,
            isLoggedIn: false,
            isAuthenticated: false,
            preferences: {
                theme: 'light',
                language: 'en',
                timezone: 'UTC',
                notifications: false
            },
            initials: 'GU',
            avatarColor: '#6c757d',
            memberSince: 'Not registered',
            sessionId: null,
            sessionData: {}
        };
    }

    // Get navigation options based on user authentication
    getNavigationForUser(user, currentPath = '/') {
        const nav = [...this.defaultNavigation];
        
        if (user && user.isLoggedIn) {
            // Add authenticated user navigation
            nav.push(
                { name: 'Profile', path: '/profile', icon: '👤' },
                { name: 'Logout', path: '/logout', icon: '🚪' }
            );
        } else {
            // Add guest navigation
            nav.push(
                { name: 'Login', path: '/login', icon: '🔑' }
            );
        }

        // Mark current page as active
        return nav.map(item => ({
            ...item,
            isActive: item.path === currentPath,
            isCurrent: item.path === currentPath
        }));
    }

    // Get complete layout data for templates
    getLayoutData(user, session, options = {}) {
        const formattedUser = this.formatUserForTemplate(user, session);
        const navigation = this.getNavigationForUser(formattedUser, options.currentPath);
        
        return {
            // User data
            user: formattedUser,
            session: session || {},
            
            // Navigation
            navigation: navigation,
            
            // Page info
            pageTitle: options.title || 'Formbar App',
            pageDescription: options.description || 'Formbar Integration Application',
            currentPath: options.currentPath || '/',
            
            // Layout options
            showHeader: options.showHeader !== false,
            showFooter: options.showFooter !== false,
            showNavigation: options.showNavigation !== false,
            
            // Theme and styling
            theme: formattedUser.preferences.theme,
            bodyClass: this.getBodyClasses(formattedUser, options),
            
            // Meta data
            timestamp: new Date().toISOString(),
            appName: 'Formbar App',
            version: '1.0.0'
        };
    }

    // Get user statistics for profile display
    getUserStats(user, additionalStats = {}) {
        const baseStats = [
            {
                label: 'User ID',
                value: user.id || 'N/A',
                icon: '🆔'
            },
            {
                label: 'Formbar ID',
                value: user.formbarId || 'Not connected',
                icon: '🔗'
            },
            {
                label: 'Member Since',
                value: user.memberSince,
                icon: '📅'
            }
        ];

        // Add additional stats if provided
        Object.entries(additionalStats).forEach(([key, value]) => {
            baseStats.push({
                label: this.formatStatLabel(key),
                value: value,
                icon: this.getStatIcon(key)
            });
        });

        return baseStats;
    }

    // Format breadcrumbs for navigation
    getBreadcrumbs(currentPath, customBreadcrumbs = null) {
        if (customBreadcrumbs) {
            return customBreadcrumbs;
        }

        const pathParts = currentPath.split('/').filter(part => part);
        const breadcrumbs = [{ name: 'Home', path: '/' }];

        let currentFullPath = '';
        pathParts.forEach(part => {
            currentFullPath += `/${part}`;
            breadcrumbs.push({
                name: this.formatBreadcrumbName(part),
                path: currentFullPath
            });
        });

        return breadcrumbs;
    }

    // Helper functions
    getUserInitials(name) {
        if (!name) return 'U';
        return name.split(' ')
                .map(word => word.charAt(0).toUpperCase())
                .slice(0, 2)
                .join('');
    }

    generateAvatarColor(userId) {
        const colors = [
            '#007bff', '#28a745', '#dc3545', '#ffc107', 
            '#17a2b8', '#6f42c1', '#fd7e14', '#20c997'
        ];
        const index = userId ? userId % colors.length : 0;
        return colors[index];
    }

    formatDate(dateInput) {
        if (!dateInput) return 'Unknown';
        
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    getBodyClasses(user, options) {
        const classes = [];
        
        // Theme class
        classes.push(`theme-${user.preferences.theme}`);
        
        // Authentication status
        if (user.isLoggedIn) {
            classes.push('user-authenticated');
        } else {
            classes.push('user-guest');
        }
        
        // Page-specific classes
        if (options.pageClass) {
            classes.push(options.pageClass);
        }
        
        return classes.join(' ');
    }

    formatStatLabel(key) {
        return key.replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    getStatIcon(key) {
        const iconMap = {
            uploads: '📁',
            documents: '📄',
            messages: '💬',
            rooms: '🏠',
            points: '⭐',
            level: '🎯',
            badges: '🏆'
        };
        return iconMap[key.toLowerCase()] || '📊';
    }

    formatBreadcrumbName(pathPart) {
        return pathPart.charAt(0).toUpperCase() + pathPart.slice(1);
    }
}

module.exports = UserLayout;