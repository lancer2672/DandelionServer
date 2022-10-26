const jwt = require('jsonwebtoken')
//nó nằm ở giữa request và respond
//next -> cho thông qua
const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization')
    //Đoạn này nếu có authHeader nó sẽ lấy "Bearer token....".split(' )[1]
    const token = authHeader && authHeader.split(' ')[1]
    if(!token)
    {
        return res.status(401).json({sucess: false, message: "Access Token not found"})
    }
    try{
        //verify xem nso phải của mình k
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.userId = decoded.userId
        next();
    }
    catch(err){
        console.log(err);
        //403 forbidden
        return res.status(403).json({sucess: false, message: "Invalid Token"})

    }
}

module.exports = verifyToken