// ========== Global Dependencies ============ //
const express = require('express')
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const bodyParser = require('body-parser');
const validator = require('express-validator');
const _ = require('lodash');
const async = require('async');
const fs = require('fs');
const xlsx = require('xlsx');
const json2xls = require('json2xls');

// ========== Setting Up Middlewares ============= //
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(validator());

// ========== Local Imports ============ //
const logger = require("../../logger");
const response = require('../responses');
const Post = require('../models/Post');

// All Posts Functions Go Here
module.exports = {

  getAllPosts: (req, res) => {
    // Pagination
    let pageSize = 25,
        pageIndex = 1,
        skip = 0;
    if (req.query.pageSize) {
      pageSize = parseInt(req.query.pageSize);
    };
    if (req.query.pageIndex) {
      pageIndex = parseInt(req.query.pageIndex);
      if (pageIndex > 1) {
        skip = pageSize * (pageIndex - 1 );
      }
    };

    // Get All Query Params in 1 Object
    var queryConditions = {};
    if (req.query.Region) {
      queryConditions.Region = { $regex: req.query.Region, $options: "i" };
    }
    if (req.query.Country) {
      queryConditions.Country = { $regex: req.query.Country, $options: "i" };
    }
    if (req.query.OrderPriority ) {
      queryConditions.OrderPriority = req.query.OrderPriority;
    }
    if (req.query.OrderID) {
      queryConditions.OrderID = req.query.OrderID;
    }
    if (req.query.UnitPrice) {
      queryConditions.UnitPrice = req.query.UnitPrice;
    }
    if (req.query.OrderDate) {
      const breakDate = req.query.OrderDate.split('/');
      queryConditions.OrderDate = { 
        $lte: new Date(`${breakDate[1]}/${breakDate[0]}/${breakDate[2]}`).toISOString() 
      }
    }
    if (req.query.ShipDate) {
      const breakDate = req.query.ShipDate.split('/');
      queryConditions.ShipDate = { 
        $lte: new Date(`${breakDate[1]}/${breakDate[0]}/${breakDate[2]}`).toISOString() 
      }
    }

    Promise.all([
      Post.
        find(queryConditions).
        limit(pageSize).
        skip(skip).
        sort({ OrderPriority: 1 , updatedAt: -1 }).
        exec(),
      Post.
        count(queryConditions).
        exec()
    ]).spread((posts, count) => {
      response.success.payload = {
        pageSize: pageSize,
        pageIndex: pageIndex,
        totalRecords: count,
        posts: posts
      };
      res.status(200).send(response.success);
    }, (err) => {
      logger.error(`Error: ${err}`);
      response.error.message = err;
      res.status(500).send(response.error);
      });
  },

  uploadPosts: (req, res) => {
    const workbook = xlsx.readFile(req.file.path);
    const sheet_name_list = workbook.SheetNames;
    const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], { blankrows: false, defval: '' });

    let validationErrors = [];
    _.forEach(jsonData, (post) => {
      post.Errors = '';
      if (!post.Region) {
        post.Errors += `Region | `;
      }
      if (!post.Country) {
        post.Errors += `Country | `;
      }
      if (!post.ItemType) {
        post.Errors += `ItemType | `;
      }
      if (!post.SalesChannel) {
        post.Errors += `SalesChannel | `;
      }
      if (!post.OrderPriority) {
        post.Errors += `OrderPriority | `;
      }
      if (!post.OrderDate) {
        post.Errors += `OrderDate | `;
      }
      if (!post.OrderID) {
        post.Errors += `OrderID | `;
      }
      if (!post.ShipDate) {
        post.Errors += `ShipDate | `;
      }
      if (!post.UnitsSold) {
        post.Errors += `UnitsSold | `;
      }
      if (!post.UnitPrice) {
        post.Errors += `UnitPrice | `;
      }
      if (!post.UnitCost) {
        post.Errors += `UnitCost | `;
      }
      if (!post.TotalRevenue) {
        post.Errors += `TotalRevenue | `;
      }
      if (!post.TotalCost) {
        post.Errors += `TotalCost | `;
      }
      if (!post.TotalProfit) {
        post.Errors += `TotalProfit | `;
      }

      if (!post.Region || !post.Country || !post.ItemType || !post.SalesChannel || !post.OrderPriority || !post.OrderDate || !post.OrderID || !post.ShipDate || !post.UnitsSold || !post.UnitPrice || !post.UnitCost || !post.TotalRevenue || !post.TotalCost || !post.TotalProfit) {
        validationErrors.push(post);
      }
    });

    if (validationErrors.length > 0) {
      // If validation error return records with error
      var xls = json2xls(jsonData);
      logger.error(`Error: ${validationErrors}`);
      var fileName = `post_upload_error_${Date.now()}.xlsx`;
      var file = fs.writeFileSync(`uploads/${fileName}`, xls, 'binary');
      res.status(400).json({ jsonData: jsonData, fileName: fileName });
    } else {
      // If No Validation Error
      _.forEach(jsonData, (post) => {
        post.OrderDate = new Date(post.OrderDate).toISOString();
        post.ShipDate = new Date(post.ShipDate).toISOString();
        let singlePost = new Post(post);
        singlePost.save();
      });
      logger.info('All records saved');
      response.success.payload = jsonData;
      res.status(200).send(response.success);
    }

    // Delete File Once Operation Complete
    fs.unlink(req.file.path, (err, success) => { });
  },



};
