exports.addTourCreator = (req, res, next) => {
  req.body.createdBy = req.user._id;
  next();
};
exports.uploadTourImages = (req, res, next) => {
  next();
};
exports.resizeTourImages = (req, res, next) => {
  next();
};
exports.aliasTopFive = () => {};

exports.createdByCurrentUser = () => {};

exports.createTour = () => {};

exports.getAllTours = () => {};
exports.getTour = () => {};
exports.getTourStats = () => {};
exports.getMonthlyPlan = () => {};
exports.getToursWithin = () => {};
exports.getDistances = () => {};

exports.updateTour = () => {};
exports.deleteTour = () => {};
