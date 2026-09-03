const { Router } = require('express');

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'maestro-cloud-api',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
