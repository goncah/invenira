# An [Inven!RA](https://doi.org/10.3390/su15010857) Implementation

### Recomended Docker Version
Docker version 27.5.0

## For users
If you're only looking to start a complete Inven!RA platform, run:
```bash
$ docker compose -f docker-compose.yaml up -d
```

Ports:
1. Frontend: http://localhost:8080
2. Backend: http://localhost:3000
3. Backend Swagger: http://localhost:3000/swagger
4. Mongo Express: http://localhost:8090/db/invenira/
5. MongoDB: mongodb://root:root@localhost:27017/
6. Keycloak: http://localhost:8091

Login with the default user admin and password admin

## For developers
### Project setup
```bash
$ npm install
```

### Start the required dev services:
```bash
$ docker compose -f docker-compose-dev.yaml up -d
```

### Start Inven!RA Backend
```bash
$ npm run backend:dev
```

### Start Inven!RA Frontend
```bash
$ npm run frontend:dev
```
