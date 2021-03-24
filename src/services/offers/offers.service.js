// Initializes the `offers` service on path `/offers`
const { Offers } = require('./offers.class');
const createModel = require('../../models/offers.model');
const hooks = require('./offers.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/offers', new Offers(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('offers');

  service.hooks(hooks);
};
