function checkLogin(req, res, next) {
    if (!req.session.userId) {
        req.session.error = "Bạn chưa đăng nhập!";
        req.session.returnTo = req.originalUrl;
        return res.redirect('/login');
    }
    next();
}

function checkGuest(req, res, next) {
    if (req.session.userId) {
        return res.redirect('/transactions');
    }
    next();
}

module.exports = { checkLogin, checkGuest };