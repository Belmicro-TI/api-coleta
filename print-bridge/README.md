# maestro-print-bridge

Serviço local responsável por receber comandos ZPL da API Vercel e enviá-los às impressoras Zebra via TCP na porta 9100.

## Pré-requisitos

- Node.js 18+
- Acesso à rede local onde estão as impressoras
- Porta 4000 liberada para receber conexões da API Vercel (ou de um túnel HTTPS)

## Instalação

```bash
cd print-bridge
npm install
```

## Configuração

```bash
cp .env.example .env
```

Edite o `.env`:

```env
PORT=4000
PRINT_BRIDGE_TOKEN=coloque-aqui-um-token-secreto-longo
```

> O `PRINT_BRIDGE_TOKEN` deve ser o mesmo valor configurado na variável `PRINT_BRIDGE_TOKEN` da API Vercel.

## Executar

```bash
npm start
```

## Como expor para a API Vercel

Como o Print Bridge roda dentro da rede local, ele precisa ser acessível via HTTPS pela API hospedada no Vercel. Opções:

**1. ngrok (mais simples para testes):**
```bash
ngrok http 4000
```
Copie a URL HTTPS gerada e coloque em `PRINT_BRIDGE_URL` na Vercel.

**2. Servidor com IP público + Nginx + SSL (produção):**
Configure um Nginx como reverse proxy com certificado SSL apontando para `localhost:4000`.

**3. VPN/túnel corporativo:** Se a empresa já tiver VPN com IP fixo, exponha a porta 4000 diretamente.

## Endpoint

### POST /print

Envia um comando ZPL para uma impressora via TCP.

**Headers:**
```
Authorization: Bearer SEU_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "address": "10.0.0.50",
  "port": 9100,
  "zpl": "^XA^FO50,50^ADN,36,20^FDHello World^FS^XZ"
}
```

**Respostas:**

| Status | Significado |
|--------|-------------|
| 200 | Etiqueta enviada com sucesso |
| 400 | Parâmetros inválidos |
| 401 | Token não informado |
| 403 | Token inválido |
| 500 | Erro ao conectar à impressora |
| 504 | Timeout de conexão |

### GET /health

Verifica se o serviço está rodando.
