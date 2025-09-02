// server/index.js
const express = require('express');
const mongoose = require('mongoose'); // <-- Is this line here?
const cors = require('cors');
require('dotenv').config(); // <-- Is this line at the top?

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// --- Database Connection --- // <-- Is this whole block here?
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected..."))
  .catch(err => console.log(err)); // This should print an error if connection fails

// --- API Routes ---
app.use('/api/auth', require('./routes/auth'));
// Add this line in server/index.js
app.use('/api/user', require('./routes/user'));
// Add this line in server/index.js
app.use('/api/borrowers', require('./routes/borrowers'));
// Add this line in server/index.js
app.use('/api/loans', require('./routes/loans'));
// Add this line in server/index.js
app.use('/api/stats', require('./routes/stats'));

app.listen(PORT, () => console.log(`Backend server is running on http://localhost:${PORT}`));