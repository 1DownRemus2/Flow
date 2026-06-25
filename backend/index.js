require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./auth');
const periodRoutes = require('./periods');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth' , authRoutes);
app.use('/periods' , periodRoutes);

app.get('/', (req, res) => {
  res.send('Period tracker backend is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
