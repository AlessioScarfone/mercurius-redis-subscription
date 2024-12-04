# Mercurius + Subscription + Redis sample

Testing repo for: [Mercurius Issue](https://github.com/mercurius-js/mercurius/issues/1114)

## Usage

**START SERVER**
```bash
npm run up #start redis
npm run start:mqemitter or npm run start:redis-sub  #start server with mqemitter-redis or graphql-redis-subscriptions
```

**SIMULATE REDIS DOWN**
```bash
npm run down #stop redis
```

**Graphql Query:**

```graphql
subscription VoteAdded {
    voteAdded(voteId: "1") {
        id
        title
        ayes
        noes
    }
}
```

```graphql
mutation VoteNo {
    voteNo(voteId: "1") {
        id
        title
        ayes
        noes
    }
}
```