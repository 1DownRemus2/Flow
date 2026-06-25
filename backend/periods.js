const express = require('express');
const pool = require('./db');
const requireAuth = require('./middleware');

const router = express.Router();

// All routes below require a valid logged-in user
router.use(requireAuth);

// CREATE a new period log
router.post('/', async (req, res) => {
  try {
    const { start_date, end_date } = req.body;

    if (!start_date) {
      return res.status(400).json({ error: 'start_date is required' });
    }

    const result = await pool.query(
      'INSERT INTO period_logs (user_id, start_date, end_date) VALUES ($1, $2, $3) RETURNING *',
      [req.userId, start_date, end_date || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// GET all period logs for the logged-in user
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM period_logs WHERE user_id = $1 ORDER BY start_date DESC',
      [req.userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// UPDATE a period log (e.g. add an end_date once the period finishes)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.body;

    const result = await pool.query(
      `UPDATE period_logs 
       SET start_date = COALESCE($1, start_date), end_date = COALESCE($2, end_date)
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [start_date, end_date, id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Log not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// DELETE a period log
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM period_logs WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Log not found' });
    }

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// GET predictions based on logged period history
router.get('/predictions', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT start_date FROM period_logs WHERE user_id = $1 ORDER BY start_date ASC',
      [req.userId]
    );

    const startDates = result.rows.map((row) => new Date(row.start_date));

    if (startDates.length < 2) {
      return res.json({
        message: 'Need at least 2 logged periods to make predictions',
        cyclesLogged: startDates.length,
        cycleLengths: [],
        averageCycleLength: null,
        cycleVariability: null,
        regularity: null,
        predictedNextStart: null,
        fertileWindowStart: null,
        fertileWindowEnd: null,
      });
    }

    const cycleLengths = [];
    for (let i = 1; i < startDates.length; i++) {
      const diffInMs = startDates[i] - startDates[i - 1];
      const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
      cycleLengths.push(diffInDays);
    }

    const averageCycleLength =
      cycleLengths.reduce((sum, len) => sum + len, 0) / cycleLengths.length;

    // Standard deviation: measures how much cycle lengths vary from the average.
    // A low number means regular cycles; a high number means irregular ones.
    const variance =
      cycleLengths.reduce((sum, len) => sum + Math.pow(len - averageCycleLength, 2), 0) /
      cycleLengths.length;
    const cycleVariability = Math.sqrt(variance);

    // Translate the raw number into a human-readable regularity label.
    // These thresholds are a reasonable rule of thumb, not a clinical standard.
    let regularity;
    if (cycleLengths.length < 3) {
      regularity = 'not enough data yet';
    } else if (cycleVariability <= 3) {
      regularity = 'regular';
    } else if (cycleVariability <= 7) {
      regularity = 'somewhat irregular';
    } else {
      regularity = 'irregular';
    }

    const lastStart = startDates[startDates.length - 1];

    const predictedNextStart = new Date(lastStart);
    predictedNextStart.setDate(predictedNextStart.getDate() + Math.round(averageCycleLength));

    const fertileWindowStart = new Date(lastStart);
    fertileWindowStart.setDate(fertileWindowStart.getDate() + 11);

    const fertileWindowEnd = new Date(lastStart);
    fertileWindowEnd.setDate(fertileWindowEnd.getDate() + 17);

    const formatDate = (date) => date.toISOString().split('T')[0];

    res.json({
      cyclesLogged: startDates.length,
      cycleLengths,
      averageCycleLength: Math.round(averageCycleLength * 10) / 10,
      cycleVariability: Math.round(cycleVariability * 10) / 10,
      regularity,
      predictedNextStart: formatDate(predictedNextStart),
      fertileWindowStart: formatDate(fertileWindowStart),
      fertileWindowEnd: formatDate(fertileWindowEnd),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
