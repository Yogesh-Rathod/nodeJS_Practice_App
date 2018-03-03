// ========== Global Dependencies ============ //
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  Region: {
    type: String,
    required: true
  },
  Country: {
    type: String,
    required: true
  },
  ItemType: {
    type: String,
    required: true
  },
  SalesChannel: {
    type: String,
    required: true
  },
  OrderPriority: {
    type: String,
    required: true
  },
  OrderDate: {
    type: String,
    required: true
  },
  OrderID: {
    type: String,
    required: true
  },
  ShipDate: {
    type: String,
    required: true
  },
  UnitsSold: {
    type: String,
    required: true
  },
  UnitPrice: {
    type: String,
    required: true
  },
  UnitCost: {
    type: String,
    required: true
  },
  TotalRevenue: {
    type: String,
    required: true
  },
  TotalCost: {
    type: String,
    required: true
  },
  TotalProfit: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;