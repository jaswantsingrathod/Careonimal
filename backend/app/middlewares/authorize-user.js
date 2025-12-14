export const authorizeUser = (roles) => {
    return (req, res, next) => {
        if (roles.includes(req.role)) {
            res.json("hacked")
        } else {
            res.status(403).json({ error: 'you are not authorized' })
        }
    }
}
