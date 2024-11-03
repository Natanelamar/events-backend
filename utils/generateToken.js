const jwt = require('jsonwebtoken');

exports.generateToken  = (res, userObj) =>{
    const accessToken = jwt.sign(userObj, process.env.SECRET_KEY,{expiresIn: '1h'})
    const refreshToken = jwt.sign(userObj, process.env.SECRET_KEY,{expiresIn: '2d'})

    res.cookie('jwtRefresh', refreshToken,{
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 2 * 24 * 60 * 60 * 1000,
    })
    res.cookie('jwtAccess', accessToken,{
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge:  1 * 60 * 60 * 1000,
    })

};
