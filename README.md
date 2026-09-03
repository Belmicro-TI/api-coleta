# maestro-cloud-api

API de integração com Sankhya, Keycloak e impressão de etiquetas Zebra. Preparada para deploy no Vercel (serverless).

## Stack

- Node.js 18+
- Express
- Axios
- Helmet
- CORS
- dotenv

---

## Instalação

```bash
npm install
```

## Configuração do ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com as credenciais reais:

| Variável | Descrição |
|---|---|
| `NODE_ENV` | `development` ou `production` |
| `SANKHYA_LOGIN_USER` | Usuário para login no MGE Sankhya |
| `SANKHYA_LOGIN_PASSWORD` | Senha do usuário MGE Sankhya |
| `SANKHYA_CLIENT_ID` | Client ID da API Sankhya |
| `SANKHYA_CLIENT_SECRET` | Client Secret da API Sankhya |
| `SANKHYA_X_TOKEN` | X-Token da API Sankhya |
| `KEYCLOAK_CLIENT_ID` | Client ID do Keycloak |
| `KEYCLOAK_CLIENT_SECRET` | Client Secret do Keycloak |
| `KEYCLOAK_TOKEN_URL` | URL do token Keycloak (possui valor padrão) |
| `ALLOWED_ORIGINS` | Origens CORS permitidas, separadas por vírgula |
| `PRINT_BRIDGE_URL` | URL pública do serviço Print Bridge |
| `PRINT_BRIDGE_TOKEN` | Token de autenticação do Print Bridge |

## Desenvolvimento local

```bash
npm run dev
```

O servidor sobe em `http://localhost:3000`.

---

## Deploy no Vercel

### 1. Crie o repositório no GitHub

```bash
git init
git add .
git commit -m "feat: initial commit"
git remote add origin https://github.com/SEU_USUARIO/maestro-cloud-api.git
git push -u origin main
```

### 2. Importe no Vercel

1. Acesse [vercel.com](https://vercel.com) e clique em **Add New > Project**
2. Conecte sua conta GitHub e selecione o repositório `maestro-cloud-api`
3. Clique em **Import**

### 3. Configure as variáveis de ambiente

Antes de fazer o deploy, vá em **Project Settings > Environment Variables** e cadastre todas as variáveis do `.env.example` com os valores reais.

### 4. Deploy

Clique em **Deploy**. O Vercel detectará automaticamente o arquivo `vercel.json` e roteará todas as requisições para a função Express em `api/index.js`.

---

## Endpoints disponíveis

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/health` | Health check da API |
| `POST` | `/sankhya/login` | Login no MGE Sankhya |
| `POST` | `/sankhya/apikey` | Obtém token da API Sankhya |
| `POST` | `/sankhya/coleta` | Envia coleta ao workflow Sankhya |
| `GET` | `/auth/token` | Obtém token do Keycloak |
| `GET` | `/print` | Envia etiqueta ZPL à impressora |

---

## Exemplos de CURL

### GET /health

```bash
curl http://localhost:3000/health
```

### POST /sankhya/login

```bash
curl -X POST http://localhost:3000/sankhya/login \
  -H "Content-Type: application/json"
```

> As credenciais vêm das variáveis de ambiente. Nenhum body é necessário.

### POST /sankhya/apikey

```bash
curl -X POST http://localhost:3000/sankhya/apikey \
  -H "Content-Type: application/json"
```

### POST /sankhya/coleta

```bash
curl -X POST http://localhost:3000/sankhya/coleta \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJSUzI1NiJ9...",
    "payload": {
      "serviceName": "ListaTarefaSP.startProcess",
      "requestBody": {
        "param": {
          "formulario": {
            "formatado": [
              {
                "entityName": "AD_ZENCOLETA",
                "records": [
                  {
                    "record": [
                      { "name": "CODPROD", "value": "1001" },
                      { "name": "QTDPROD", "value": "10" },
                      { "name": "CODLOCALORIG", "value": "EST001" }
                    ]
                  }
                ]
              }
            ]
          }
        }
      }
    }
  }'
```

> O campo `DHINCLUSAO` é injetado automaticamente pela API com a data/hora de Brasília.

### GET /auth/token

```bash
curl http://localhost:3000/auth/token
```

### GET /print

```bash
curl "http://localhost:3000/print?address=10.0.0.50&zpl=%5EXA%5EFO50%2C50%5EAD%5EFDHello%20World%5EFS%5EXZ"
```

---

## Testando no Postman

### GET /health

- **Método:** GET
- **URL:** `http://localhost:3000/health`

---

### POST /sankhya/login

- **Método:** POST
- **URL:** `http://localhost:3000/sankhya/login`
- **Headers:** `Content-Type: application/json`
- **Body:** nenhum (credenciais vêm do `.env`)

---

### POST /sankhya/apikey

- **Método:** POST
- **URL:** `http://localhost:3000/sankhya/apikey`
- **Headers:** `Content-Type: application/json`
- **Body:** nenhum

---

### POST /sankhya/coleta

- **Método:** POST
- **URL:** `http://localhost:3000/sankhya/coleta`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**

```json
{
  "token": "SEU_TOKEN_SANKHYA",
  "payload": {
    "serviceName": "ListaTarefaSP.startProcess",
    "requestBody": {
      "param": {
        "formulario": {
          "formatado": [
            {
              "entityName": "AD_ZENCOLETA",
              "records": [
                {
                  "record": [
                    { "name": "CODPROD", "value": "1001" },
                    { "name": "QTDPROD", "value": "10" },
                    { "name": "CODLOCALORIG", "value": "EST001" }
                  ]
                }
              ]
            }
          ]
        }
      }
    }
  }
}
```

---

### GET /auth/token

- **Método:** GET
- **URL:** `http://localhost:3000/auth/token`

---

### GET /print

- **Método:** GET
- **URL:** `http://localhost:3000/print`
- **Query Params:**
  - `address`: `10.0.0.50`
  - `zpl`: `^XA^FO50,50^ADN,36,20^FDHello World^FS^XZ`

---

## Print Bridge

O Print Bridge é um serviço separado que deve rodar dentro da rede local da empresa para enviar comandos ZPL às impressoras via TCP.

Consulte a documentação completa em [`print-bridge/README.md`](./print-bridge/README.md).

### Fluxo de impressão

```
Aplicativo
    ↓
API Vercel (HTTPS)
    ↓
Print Bridge (rede local, HTTPS exposto)
    ↓ TCP :9100
Impressora Zebra
```

### Instalação do Print Bridge

```bash
cd print-bridge
npm install
cp .env.example .env
# edite .env com o token
npm start
```
"# api-coleta" 
