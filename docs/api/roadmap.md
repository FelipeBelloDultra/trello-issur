# Roadmap — apps/api

Companheiro de [`backend-map.html`](./backend-map.html) (retrato do estado atual). Este documento
é o próximo passo: **o que priorizar**, **quais fluxos ainda estão incompletos** e **por onde
seguir**. Levantado lendo o código-fonte, sem inferência.

## Resumo

O que existe hoje é uma infraestrutura de conta/workspace/RBAC/notificações madura — auth com
JWT+Valkey, outbox pattern (agora cobrindo 100% dos publish-after-write, ver "Concluído" abaixo),
retry escalonado com dead-letter (idempotente e autenticado), cache-aside com invalidação ativa,
circuit breaker. Specs 001–005 (todo o debt pequeno/isolado identificado nesta varredura)
implementadas, testadas e mergeadas — ver seção "Concluído" para o que cada uma fechou. O que
**não existe ainda** é o produto em si: `apps/api/src/modules/` só tem `account`, `auth`,
`workspace` e `notifications`. Não há módulo `board` nem `card`. As permission keys
`board:create/edit/delete` e `card:create/edit/delete/move/assign`
(`src/modules/auth/domain/value-objects/permission-key.ts`) já estão no registry de RBAC, mas não
protegem nenhuma rota real — é RBAC pronto para uma funcionalidade que ainda não foi construída.
Com o debt pequeno fechado, o item que define o próximo ciclo de trabalho é o board/card (spec
006).

## Prioridades

### Produto ausente

- **Módulo `board`/`card` não existe.** Sem ele, o RBAC de `board:*`/`card:*` é código morto e o
  produto não tem sua função central (é um Kanban sem quadro). Não é um bug para corrigir — é uma
  decisão de escopo para tomar antes de começar (ver [spec 006](./specs/006-board-card-module.md)).

## Concluído

Specs 001–005 — implementadas, testadas (unit + e2e) e mergeadas em `main` via PRs #10–#14
(stack). Detalhe completo de requisitos/design em cada arquivo de spec (marcado
`Status: Concluído` no cabeçalho).

- **[001](./specs/001-secure-queue-admin-routes.md) — Autenticar rotas de fila.**
  `GET /queue/dead-letters` e `POST /queue/dead-letters/:id/replay` exigem header
  `x-internal-token` (segredo operacional, `QUEUE_ADMIN_TOKEN`), não login de produto.
- **[002](./specs/002-rbac-cache-invalidation.md) — Invalidação ativa do cache de RBAC.**
  `UpdateWorkspaceMemberRoleHandler` e `RemoveWorkspaceMemberHandler` agora chamam
  `AccountRoleCacheRepository.invalidate()` antes de retornar sucesso — mudança de role/remoção
  reflete na próxima checagem de autorização, sem esperar o TTL de 5 min. Cache adapter também
  passou a falhar aberto (log + segue) em vez de propagar erro do Valkey.
- **[003](./specs/003-close-invite-rejection-flow.md) — Fechar rejeição de convite.**
  `reject()` espelha `accept()`: escrita atômica via `UnitOfWork` + evento de outbox
  `workspace-invite.rejected` + `WorkspaceInviteRejectedConsumer` notificando quem convidou.
- **[004](./specs/004-dead-letter-replay-idempotency.md) — Idempotência no replay.**
  Replay publica com chave determinística (`replay:<event.id>`) em vez de uma nova a cada
  chamada — duas chamadas para o mesmo evento (corrida ou duplo clique) não duplicam mais o
  side effect.
- **[005](./specs/005-align-invite-permission-key.md) — Alinhar permissão de convite.**
  `InviteMemberController` exige `workspace:invite` (Opção A) em vez de `workspace:manage` —
  `member` já tinha essa permissão no `ROLE_PERMISSION_MAP` e agora ela é de fato checada.

Como efeito colateral dessas specs: a nota do `CLAUDE.md` sobre handlers pendentes de migração
para outbox foi corrigida (os 3 handlers que publicam eventos — `CreateAccountHandler`,
`InviteMemberHandler`, `RespondToInviteHandler` — já passam todos pelo outbox, sem exceção).

### Debt menor / cobertura ainda aberto

- `CreateAccountController`: branch `default` do switch de erro faz `throw new Error()` cru em
  vez de um `HttpException` estruturado. Hoje é código morto (só existe 1 erro possível), mas é
  uma armadilha para o próximo `left` que for adicionado sem atualizar o controller.
- E2e do fluxo de convite cobre hoje só criar → **rejeitar** (spec 003). Criar → **aceitar**
  ainda não tem e2e dedicado, só specs unitárias com repositórios em memória.

## Próximos passos sugeridos

1. **Dimensionar e iniciar o módulo `board`** (via skill `new-module` já disponível no repo) —
   é o maior item do roadmap, então merece ser discutido à parte antes de codar: quadros, colunas,
   cards, limites de WIP, ordenação/drag-and-drop, quem pode ver o quê (o RBAC de `board:*`/
   `card:*` já existe e está esperando por isso). Não assumir escopo aqui.
2. **Cobertura/limpeza residual** — e2e do fluxo criar→aceitar convite, corrigir o
   `throw new Error()` cru em `CreateAccountController`. Baixo risco, pode intercalar com o item
   acima; nenhum dos dois gera spec própria (trivial demais, ver `specs/README.md`).

## Adiado conscientemente

- **Notificações em tempo real** (WebSocket/SSE) — hoje é só polling em `GET /notifications`.
  Não é debt, é uma feature nova; vale esperar ter uso real para saber se compensa a
  complexidade.
- **Calibrar thresholds do circuit breaker** (`CIRCUIT_BREAKER_*`) contra tráfego real — os
  valores atuais são conservadores por design, calibrar sem tráfego real seria adivinhação.
