import jwt from "jsonwebtoken"

export const  authenticateUser = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'Token not provided' })
    }
    try {
        let tokenData = jwt.verify(token, process.env.JWT_SECRETE)
        console.log('Token data', tokenData);
        req.userId = tokenData.userId
        req.role = tokenData.role
        next()
    } catch (err) {
        return res.status(401).json({ error: err.message })
    }
}