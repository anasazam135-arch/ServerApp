function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
    // Simple, practical email check (enough for course projects)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateRegisterInput({ email, fullName, password }) {
    const normalizedEmail = normalizeEmail(email);
    const name = String(fullName || "").trim();
    const pwd = String(password || "");

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
        throw new Error("Please enter a valid email address.");
    }
    if (!name || name.length < 2) {
        throw new Error("Please enter your full name.");
    }
    if (pwd.length < 6) {
        throw new Error("Password must be at least 6 characters.");
    }

    return { email: normalizedEmail, fullName: name, password: pwd };
}

function validateLoginInput({ email, password }) {
    const normalizedEmail = normalizeEmail(email);
    const pwd = String(password || "");

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
        throw new Error("Invalid email or password.");
    }
    if (!pwd) {
        throw new Error("Invalid email or password.");
    }

    return { email: normalizedEmail, password: pwd };
}

module.exports = {
    normalizeEmail,
    validateRegisterInput,
    validateLoginInput,
};
