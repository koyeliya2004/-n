const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });

app.use(cors());
app.use(express.json());
app.use(limiter);

// API routes
app.use('/api', apiRoutes);

// Serve frontend in production
const buildPath = path.join(__dirname, '..', 'frontend', 'build');
app.use(express.static(buildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`RTRWH Backend running on port ${PORT}`);
  });
}

module.exports = app;
