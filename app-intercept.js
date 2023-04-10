let jwt = require("jsonwebtoken");
let base = require('./base');

class AppIntercept {

    // token校验拦截器
    token(req, res, next){
        let token_skip = ['/login','/refreshToken'];
        if(token_skip.indexOf(req.originalUrl)!=-1)return next();
        jwt.verify(req.headers.accesstoken,process.env.JWT_PWD,async (err, decoded) => {
            console.info('decoded',decoded)
            let result = await base.execSql('SELECT uid,name,IsAdmin FROM tb_user WHERE uid = ?', [decoded.uid]);
            if (result.length == 0) return res.status(401).json('请重新登录!');
            if (err && err.name == 'TokenExpiredError') return res.status(402).json("登录过期");
            if (err) return res.status(401).json("请先登录");
            req.body['userInfo'] = decoded;
            next();
        })
    }

    // 允许跨域
    cross(req, res, next){
        res.header("Access-Control-Allow-Origin", "*")
        res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , AccessToken,RefreshToken');
        res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
        res.header('Access-Control-Expose-Headers', "*");
        if(req.method.toLowerCase() == 'options')return res.status(200).json();
        next()
    }

}

// 导出
module.exports = new AppIntercept();
