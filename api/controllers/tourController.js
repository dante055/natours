const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const ApiFeatures = require('../utils/ApiFeatures');

exports.addTourCreator = (req, res, next) => {
  // req.body.createdBy = req.user._id;
  next();
};
exports.uploadTourImages = (req, res, next) => {
  next();
};
exports.resizeTourImages = (req, res, next) => {
  next();
};

exports.aliasTopFive = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  next();
};

exports.createdByCurrentUser = (req, res, next) => {
  req.query.createdBy = req.user._id;
  next();
};

exports.createTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { tour },
  });
});

exports.getAllTours = catchAsync(async (req, res, next) => {
  const { query } = new ApiFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  const tours = await query;

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: { tours },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numRatings: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgRating: -1 } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  const month = Number(req.query.month);

  let match = {
    startDates: {
      $gte: new Date(`${year}-01-01`),
      $lte: new Date(`${year}-12-31`),
    },
  };

  if (month) {
    match = {
      startDates: {
        $gte: new Date(`${year}-${month}-01`),
        $lte: new Date(`${year}-${month}-31`),
      },
    };
  }

  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: match,
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStart: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } },
    { $sort: { month: -1 } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {});
exports.getDistances = catchAsync(async (req, res, next) => {});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.tourId, req.body, {
    new: true,
    runValidator: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  await Tour.findByIdAndDelete(req.params.tourId);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
