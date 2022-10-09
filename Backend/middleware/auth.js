const jwt = require('jsonwebtoken');
 
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, process.env.TOKEN_KEY);
       if(!decodedToken){
        console.error('Unauthorized')
        return res.status(403).json({ message : "Unauthorized" })
       }
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(500).json({ message: 'Internal error' });
   }
};