# Food Art Director AI

Sistema de Direção Visual Gastronômica — SaaS Premium

## Stack

- **Vite** — build tool moderno
- **Vercel** — hospedagem e deploy
- **Memberstack** — autenticação e planos
- **Stripe** — pagamentos (futuro)

## Estrutura

```
foodart/
├── index.html              # Entry point
├── vite.config.js          # Vite config
├── vercel.json             # Vercel config
├── package.json
├── .env.example            # Variáveis de ambiente
├── public/                 # Assets estáticos
│   └── favicon.ico
└── src/
    ├── main.js             # Entry point JS
    ├── wizard.js           # Lógica do wizard
    ├── styles/
    │   └── main.css        # CSS completo
    ├── data/
    │   └── index.js        # Dados: INTENTS, FD, PH, ENV...
    ├── utils/
    │   ├── memberstack.js  # Auth integration
    │   └── stripe.js       # Payments (future)
    └── components/         # Futuras expansões
```

## Desenvolvimento

```bash
npm install
npm run dev
```

## Deploy (Vercel)

```bash
npm run build
# ou push para GitHub — Vercel faz deploy automático
```

## Memberstack

Chave pública: `pk_sb_89e84c8e7969fa7ad0b2`

Para ativar autenticação, descomentar o script do Memberstack em `index.html`
e chamar `requireAuth()` nas páginas protegidas.

## Próximos passos

1. [ ] Ativar Memberstack SDK no index.html
2. [ ] Criar página de login/signup
3. [ ] Proteger acesso ao wizard
4. [ ] Configurar planos no Memberstack dashboard
5. [ ] Integrar Stripe para assinaturas
6. [ ] Histórico de prompts por usuário
