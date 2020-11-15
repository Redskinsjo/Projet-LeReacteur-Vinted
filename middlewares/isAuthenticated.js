const User = require('../models/User');

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    // const token = req.headers.authorization.replace('Bearer ', '');
    const token = req.headers.authorization;
    try {
      const userSearched = await User.findOne({ token }).select('-hash -salt');
      if (userSearched) {
        req.user = userSearched;
        return next();
        // res.status(200).json(token);
      } else {
        res.status(401).json({ error: { message: 'Unauthorized' } });
      }
    } catch (error) {
      res.status(401).json({ error: { message: error.message } });
    }
  } else {
    res.status(401).json({ error: { message: 'Unidentified' } });
  }
};

// const isAuthenticated = async (req, res, next) => {
//   if (req.headers.authorization) {
//     const token = req.headers.authorization.replace('Bearer ', '');
//     try {
//       const userSearched = await User.findOne({ token }).select('-hash -salt');
//       if (userSearched) {
//         req.user = userSearched;
//         return next();
//       } else {
//         res.status(401).json({ error: { message: 'Unauthorized' } });
//       }
//     } catch (error) {
//       res.status(401).json({ error: { message: error.message } });
//     }
//   } else {
//     res.status(401).json({ error: { message: 'Unidentified' } });
//   }
// };

module.exports = isAuthenticated;
