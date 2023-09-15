const VoximplantApiClient = require("@voximplant/apiclient-nodejs").default;
require("dotenv").config();

const client = new VoximplantApiClient("./voximplant_credientials.json");
const addUser = (userData) => {
  const { userName, userDisplayName, userPassword } = userData;
  return client.Users.addUser({
    userName,
    userDisplayName,
    userPassword,
    applicationId: 10651682,
  });
};
const setUserInfo = (userData) => {
  return client.Users.setUserInfo(userData);
};

module.exports = {
  addUser,
  setUserInfo,
};
