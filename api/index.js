const { handleRequest } = require('./backend');

module.exports = async (req, res) => {
    return handleRequest(req, res);
};
