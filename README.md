# 📚 Bookmarket CLI management tool

```txt
        .---.                        .---.
    .---|___|            .---.       |~~~|
.---|===|---|_           |___|       |~~~|---.
|   |===|   |  \     .---!~~~|   .---|   |---|
|   |   |   |   \    |===|   |---|%%%|   |   |
| B | O | O |\ K \   | M | A | R | K | E | T |
|   |   |   | \   \  |===|   |===|   |   |   |
|   |   |___|  \   \ |   |___|___|   |~~~|___|
|   |===|---|   \   \|===|~~~|---|%%%|~~~|---|
'---^---^---'    `---'---^---^---^---^---'---' A powerful tool for changing the world...
```

## Environment

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") <-- change when using `npx prisma` commands
}
```

### Secrets

- Local `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`
  - DATABASE_URL
  - DATABASE_URL_TEST
- Remote `postgresql://OWNER:PASSWORD@HOST/USER.DATABASE?schema=public`
  - DATABASE_URL_CLOUD
  - DATABASE_URL_CLOUD_TEST

### Options

- IS_REMOTE_DB = `true | false`
- NODE_ENV = `development | production | test`
