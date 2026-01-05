
function getUserData(session) {
    return {
        user: session.user
    };
}

function getProfileData(session, uploads) {
    return {
        user: session.user,
        uploads: uploads,
        uid: session.id
    };
}

module.exports = {
    getUserData,
    getProfileData
};
