const { handleRequest } = require('./backend');

module.exports = async (req, res) => {
    try {
        await handleRequest(req, res);
    } catch (err) {
        console.error('Serverless [...path] Error:', err);
        if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message, stack: err.stack }));
        }
    }
};
