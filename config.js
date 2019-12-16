module.exports = {
    port: process.env["PORT"] || 4000,
    databaseUrl: process.env["DATABASE_URL"] || 'mongodb://meduza:meduza1@ds039211.mlab.com:39211/heroku_r6h4pk24',
    cloudName: process.env["CLOUD_NAME"] || 'dcbufz3ay',
    apiKey: process.env["API_KEY"] || '682228848683952',
    apiSecret: process.env["API_SECRET"] || 'JD7SE-LeWg4_cQl8def6DcMQwUc'
};