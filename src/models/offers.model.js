// offers-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = "offers";
  const mongooseClient = app.get("mongooseClient");
  const { Schema, mongoose } = mongooseClient;
  const schema = new Schema(
    {
      text: { type: String, required: true },
      product_details: [
        { brand: String },
        { size: String },
        { color: String },
        { quality: String },
        { location: String },
      ],
      product_pictures: Array,
      product_name: String,
      product_description: String,
      product_price: Number,
      owner: { type: Schema.Types.ObjectId, ref: "users" },
      product_image: Object,
    },
    {
      timestamps: true,
    }
  );

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
};
