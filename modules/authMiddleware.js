function checkLogin(req, res, next) {
    if (!req.session.userId) {
        req.session.error = "Bạn chưa đăng nhập!";
        return res.redirect('/login');
    }

    return next();
}

module.exports = checkLogin;