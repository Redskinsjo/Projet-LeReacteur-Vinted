const express = require('express');
const Router = express.Router();
const Offer = require('../models/Offer');
const isAuthenticated = require('../middlewares/isAuthenticated');
const cloudinary = require('cloudinary').v2;

// Publishing of an offer on the marketplace if connected
Router.post('/offer/publish', isAuthenticated, async (req, res) => {
  const body = req.fields;

  try {
    // Check the content of the request
    if (Object.keys(body).length > 0) {
      let details = [];
      for (const key in body) {
        if (
          key !== 'product_name' &&
          key !== 'product_image' &&
          (key !== 'product_price') & (key !== 'product_description')
        ) {
          details.push({ [key]: body[key] });
        }
      }

      // Upload the picture in Cloudinary SaaS service
      let returnedPicture;
      if (req.files.product_image) {
        const pictureToUpload = req.files.product_image.path;
        returnedPicture = await cloudinary.uploader.upload(pictureToUpload, {
          folder: '/vinted/offers',
          use_filename: true,
        });
      }

      // Creating a new offer and save it to the DB
      const newOffer = new Offer({
        product_name: body.product_name,
        product_description: body.product_description,
        product_price: body.product_price,
        product_details: details,
        owner: req.user,
        product_image: returnedPicture,
        product_pictures: body.product_pictures,
      });
      await newOffer.save();
      res.status(200).json(newOffer);
    } else {
      res.status(400).json({
        error: { message: 'The request should include body parameters' },
      });
    }
  } catch (error) {
    res.status(400).json(error.response);
  }
});

// Modify an offer if user is connected
Router.put('/offer/modify', isAuthenticated, async (req, res) => {
  const query = req.query;
  const body = req.fields;
  const files = req.files;

  try {
    if (query.id) {
      // Retrieve the offer by its id
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

        // Upload the picture in Cloudinary
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

// Delete an offer
Router.delete('/offer/delete', isAuthenticated, async (req, res) => {
  const query = req.query;

  // Check if exists - Delete if yes/ Send an error message otherwise
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

// Retrieve all offers of the DB following filters
Router.get('/offers', async (req, res) => {
  const q = req.query;
  try {
    const search = {};
    const sort = {};
    const pageLimit = q.limit;
    let skipCount = q.page;
    for (const key in q) {
      if (key === 'title') search['product_name'] = new RegExp(q[key], 'i'); // Search by name
      if (key === 'priceMin') {
        if (search['product_price']) search['product_price']['$gte'] = q[key];
        // Search by minimum price
        else {
          search['product_price'] = {};
          search['product_price']['$gte'] = q[key];
        }
      }
      if (key === 'priceMax') {
        if (Object.keys(search['product_price']).length > 0)
          search['product_price']['$lte'] = q[key];
        // Search by maximum price
        else {
          search['product_price'] = {};
          search['product_price']['$lte'] = q[key];
        }
      }
      if (key === 'sort') {
        if (q[key] === 'price-desc') sort['product_price'] = 'desc';
        // Sort the offers
        else if (q[key] === 'price-asc') sort['product_price'] = 'asc';
      }
      if (key === 'page') skipCount = q[key];
    }
    const offersSearched = await Offer.find(search) // Retrieve the data
      .populate({ path: 'owner', select: '-hash -salt' })
      .sort(Object.keys(sort).length === 0 ? null : sort)
      .limit(pageLimit)
      .skip(skipCount === 0 ? null : pageLimit * (skipCount - 1));

    const count = await Offer.countDocuments(search, (err, count) => {
      // Count the number of item returned
      return count;
    });
    res.status(200).json({
      count,
      offers: offersSearched,
    });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

// Retrieve an offer by its id
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
