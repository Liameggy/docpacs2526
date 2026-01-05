// provides helper functions related to user UI and data formatting
function formatUserLayoutData(userData) {
    return {
        id: userData.id,
        name: userData.name,
        layout: userData.layout || 'default',
        preferences: userData.preferences || {}
    };
}
module.exports.formatUserLayoutData = formatUserLayoutData;
function applyUserLayoutSettings(user, layoutSettings) {
    user.layout = layoutSettings.layout || user.layout;
    user.preferences = {
        ...user.preferences,
        ...layoutSettings.preferences
    };
    return user;
}
module.exports.applyUserLayoutSettings = applyUserLayoutSettings;
function getUserLayout(user) {
    return {
        layout: user.layout || 'default',
        preferences: user.preferences || {}
    };
}
module.exports.getUserLayout = getUserLayout;

// converts the user object into a form that's easy to pass into EJS templates
function prepareUserForTemplate(user) {
    return {
        id: user.id,
        name: user.name,
        layout: user.layout || 'default',
        preferences: user.preferences || {}
    };
}
module.exports.prepareUserForTemplate = prepareUserForTemplate;

// Adds common layout information
function addCommonLayoutInfo(req, res, next) {
    res.locals.isLoggedIn = !!req.session.userId;
    res.locals.displayName = req.session.userName || 'Guest';
    res.locals.navOptions = req.session.userId ? [
        { name: 'Dashboard', link: '/dashboard' },
        { name: 'Profile', link: '/profile' },
        { name: 'Logout', link: '/logout' }
    ] : [
        { name: 'Login', link: '/login' },
        { name: 'Register', link: '/register' }
    ];
    next();
}
module.exports.addCommonLayoutInfo = addCommonLayoutInfo;

// Keeps view-related user logic out of route files
function renderUserLayoutPage(res, template, userData) {
    const layoutData = prepareUserForTemplate(userData);
    res.render(template, { user: layoutData });
}
module.exports.renderUserLayoutPage = renderUserLayoutPage;

