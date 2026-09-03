const { Router } = require('express');
const { sendPrint } = require('../services/print.service');

const router = Router();

router.get('/', async (req, res) => {
  const { address, zpl } = req.query;

  if (!address || !zpl) {
    return res.status(400).json({
      success: false,
      error: 'Os parâmetros "address" e "zpl" são obrigatórios',
    });
  }

  const result = await sendPrint(address, zpl);
  return res.status(result.status).json(result.body);
});

module.exports = router;
