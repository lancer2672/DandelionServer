const _ = require("lodash");

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

// [a,b,c] => {a:1, b:1, c:1}
const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((t) => [t, 1]));
};
const excludeSelectData = (select = []) => {
  return Object.fromEntries(select.map((t) => [t, 0]));
};
module.exports = {
  getInfoData,
  getSelectData,
  excludeSelectData,
};
