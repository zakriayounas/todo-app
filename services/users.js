export const extractUserId = (req) => {
    const userId = req.headers.get("x-user-id");

    if (!userId || isNaN(userId)) {
        throw new Error("Invalid user ID");
    }

    return parseInt(userId, 10);
};
export const excludePasswordField = (user) => {
    if (!user) return
    const { password: userPassword, ...restUserFields } = user
    return restUserFields
}