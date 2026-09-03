require('dotenv').config();
const express = require('express');
const net = require('net');

const app = express();
app.use(express.json());

const BRIDGE_TOKEN = process.env.PRINT_BRIDGE_TOKEN;
const PORT = process.env.PORT || 4000;

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Token de autorização não informado',
    });
  }

  const parts = authHeader.split(' ');
  const token = parts.length === 2 ? parts[1] : parts[0];

  if (!BRIDGE_TOKEN) {
    return res.status(500).json({
      success: false,
      error: 'Servidor mal configurado: PRINT_BRIDGE_TOKEN não definido',
    });
  }

  if (token !== BRIDGE_TOKEN) {
    return res.status(403).json({
      success: false,
      error: 'Token de autorização inválido',
    });
  }

  next();
}

function isValidIP(ip) {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) return false;
  return ip.split('.').every((part) => parseInt(part, 10) <= 255);
}

app.post('/print', authMiddleware, (req, res) => {
  const { address, port = 9100, zpl } = req.body;

  if (!address || !zpl) {
    return res.status(400).json({
      success: false,
      error: 'Os campos "address" e "zpl" são obrigatórios',
    });
  }

  if (!isValidIP(address)) {
    return res.status(400).json({
      success: false,
      error: 'Endereço IP inválido',
    });
  }

  if (typeof zpl !== 'string' || !zpl.trim().startsWith('^XA')) {
    return res.status(400).json({
      success: false,
      error: 'ZPL inválido: deve iniciar com ^XA',
    });
  }

  let responded = false;

  const printer = new net.Socket();
  printer.setTimeout(10000);

  printer.connect(port, address, () => {
    printer.write(zpl, 'utf8', () => {
      printer.end();
    });
  });

  printer.on('close', () => {
    if (!responded) {
      responded = true;
      console.log(`Etiqueta enviada para ${address}:${port}`);
      res.json({
        status: 'ok',
        message: `Etiqueta enviada para ${address}:${port}`,
      });
    }
  });

  printer.on('error', (err) => {
    printer.destroy();
    if (!responded) {
      responded = true;
      console.error(`Erro ao conectar à impressora ${address}:${port} - ${err.message}`);
      res.status(500).json({
        success: false,
        error: `Erro ao conectar à impressora: ${err.message}`,
      });
    }
  });

  printer.on('timeout', () => {
    printer.destroy();
    if (!responded) {
      responded = true;
      console.error(`Timeout ao conectar à impressora ${address}:${port}`);
      res.status(504).json({
        success: false,
        error: 'Timeout ao conectar à impressora',
      });
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'maestro-print-bridge',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`[maestro-print-bridge] Servidor rodando em http://localhost:${PORT}`);
});
