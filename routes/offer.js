const express = require('express');
const Router = express.Router();
const Offer = require('../models/Offer');
const User = require('../models/User');
const isAuthenticated = require('../middlewares/isAuthenticated');
const cloudinary = require('cloudinary').v2;

// cloudinary.config({
//   cloud_name: "de822mdsy",
//   api_key: "683325958423579",
//   api_secret: "Ijex7t-hawHHXD9uX10L0f3Myso",
// });

Router.post('/offer/publish', async (req, res) => {
  const body = req.fields;
  // const token = req.headers.authorization.replace('Bearer ', '');

  try {
    if (Object.keys(body).length > 0) {
      // if (token.length > 0) {
      //   const userSearched = await User.findOne({ token });
      // if (userSearched) {
      let details = [];
      for (const key in body) {
        if (key === 'details') {
          details.push({ [key]: body[key] });
          details = [...body[key]];
        }
      }
      // if (req.files.picture) {
      // const pictureToUpload = req.files.picture.path;
      // const returnedPicture = await cloudinary.uploader.upload(
      //   pictureToUpload,
      //   {
      //     folder: '/vinted/offers',
      //     use_filename: true,
      //   }
      // );
      const newOffer = new Offer({
        product_name: body.product_name,
        product_description: body.product_description,
        product_price: body.product_price,
        product_details: body.product_details,
        owner: req.user,
        product_image: body.product_image,
      });
      await newOffer.save();
      res.status(200).json('newOffer has been added to the DB');
      // } else {
      //   res.status(401).json({
      //     error: { message: 'Missing a picture' },
      //   });
      // }
      // } else {
      //   res.status(400).json({
      //     error: { message: 'The user is not identified' },
      //   });
      // }
      // } else {
      //   res.status(400).json({
      //     error: { message: 'The request should include a user token' },
      //   });
      // }
    } else {
      res.status(400).json({
        error: { message: req.fields },
      });
    }
  } catch (error) {
    // res.status(400).json({ error: { message: error.message } });
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

// Router.post('/offer/publish', isAuthenticated, async (req, res) => {
//   const body = req.fields;
//   const token = req.headers.authorization.replace('Bearer ', '');

//   try {
//     if (Object.keys(body).length > 0) {
//       if (token.length > 0) {
//         const userSearched = await User.findOne({ token });
//         if (userSearched) {
//           // let details = [];
//           // for (const key in body) {
//           //   if (key === 'details') {
//           //     details.push({ [key]: body[key] });
//           //     details = [...body[key]];
//           //   }
//           // }
//           if (req.files.picture) {
//             const pictureToUpload = req.files.picture.path;
//             const returnedPicture = await cloudinary.uploader.upload(
//               pictureToUpload,
//               {
//                 folder: '/vinted/offers',
//                 use_filename: true,
//               }
//             );
//             const newOffer = new Offer({
//               product_name: body.title,
//               product_description: body.description,
//               product_price: body.price,
//               product_details: [...body.details],
//               owner: req.user,
//               product_image: returnedPicture,
//             });
//             await newOffer.save();
//             res.status(200).json(newOffer);
//           } else {
//             res.status(401).json({
//               error: { message: 'Missing a picture' },
//             });
//           }
//         } else {
//           res.status(400).json({
//             error: { message: 'The user is not identified' },
//           });
//         }
//       } else {
//         res.status(400).json({
//           error: { message: 'The request should include a user token' },
//         });
//       }
//     } else {
//       res.status(400).json({
//         error: { message: 'The request should include body parameters' },
//       });
//     }
//   } catch (error) {
//     // res.status(400).json({ error: { message: error.message } });
//     console.log(error);
//     res.status(400).json({ error: error.message });
//   }
// });

Router.put('/offer/modify', isAuthenticated, async (req, res) => {
  const query = req.query;
  const body = req.fields;
  const files = req.files;

  try {
    if (query.id) {
      const offerSearched = await Offer.findById(query.id);
      if (offerSearched) {
        if (body) {
          for (const key in body) {
            if (typeof body[key] !== 'object') {
              offerSearched[key] = body[key];
            }
          }
          await offerSearched.save();
        }

        if (files) {
          const pictureToUpload = files.picture.path;
          const result = await cloudinary.uploader.upload(pictureToUpload);
          offerSearched.product_image = result;
          await offerSearched.save();
        }

        res.status(200).json({ offerSearched });
      } else {
        res.status(400).json({ error: { message: 'The offer was not found' } });
      }
    } else {
      res
        .status(400)
        .json({ error: { message: 'An id has to be specified in the query' } });
    }
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

Router.delete('/offer/delete', isAuthenticated, async (req, res) => {
  const query = req.query;

  try {
    if (query.id) {
      const offerSearched = await Offer.findById(query.id);
      if (offerSearched) {
        await offerSearched.deleteOne();
        res.status(400).json({ message: 'The offer was well deleted' });
      } else {
        res.status(400).json({ error: { message: 'The offer was not found' } });
      }
    } else {
      res
        .status(400)
        .json({ error: { message: 'An id has to be specified in the query' } });
    }
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

Router.get('/offers', async (req, res) => {
  const q = req.query;
  //   title : String
  // priceMin : Number
  // priceMax : Number
  // sort : Valeurs possibles "price-desc", "price-asc"
  // page: Number (Si ce paramètre n'est pas transmis, il faudra forcer l'affichage de la première page. À vous de définir combien de résultats vous voulez afficher par page)

  // if (Object.keys(q).length > 0) {
  try {
    const search = {};
    const sort = {};
    const pageLimit = 2;
    let skipCount = 0;
    for (const key in q) {
      if (key === 'title') search['product_name'] = new RegExp(q[key], 'i');
      if (key === 'priceMin') {
        if (search['product_price']) search['product_price']['$gte'] = q[key];
        else {
          search['product_price'] = {};
          search['product_price']['$gte'] = q[key];
        }
      }
      if (key === 'priceMax') {
        if (Object.keys(search['product_price']).length > 0)
          search['product_price']['$lte'] = q[key];
        else {
          search['product_price'] = {};
          search['product_price']['$lte'] = q[key];
        }
      }
      if (key === 'sort') {
        if (q[key] === 'price-desc') sort['product_price'] = 'desc';
        else if (q[key] === 'price-asc') sort['product_price'] = 'asc';
      }
      if (key === 'page') skipCount = q[key];
    }
    console.log(skipCount);
    const offersSearched = await Offer.find(search)
      .populate({ path: 'owner', select: '-hash -salt' })
      .sort(Object.keys(sort).length === 0 ? null : sort) // .sort(sort)
      .limit(pageLimit)
      .skip(skipCount === 0 ? null : pageLimit * (skipCount - 1));

    const count = await Offer.countDocuments(search, (err, count) => {
      return count;
    });
    res.status(200).json({
      count,
      offers: offersSearched,
    });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
  // } else {
  //   res.status(400).json({ error: { message: 'Missing parameters' } });
  // }
});

Router.get('/offer/:id', async (req, res) => {
  const params = req.params;

  try {
    if (params.id) {
      const offerSearched = await Offer.findById(params.id).populate({
        path: 'owner',
        select: '-hash -salt',
      });
      if (offerSearched) {
        res.status(200).json(offerSearched);
      } else {
        res.status(400).json({ error: { message: 'No offer was found' } });
      }
    }
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

module.exports = Router;
