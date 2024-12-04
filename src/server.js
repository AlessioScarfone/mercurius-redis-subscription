import Fastify from 'fastify'
import { mercurius } from 'mercurius'

const schema = `
  type Vote {
    id: ID!
    title: String!
    ayes: Int
    noes: Int
  }

  type Query {
    votes: [Vote]
  }

  type Mutation {
    voteAye(voteId: ID!): Vote
    voteNo(voteId: ID!): Vote
  }

  type Subscription {
    voteAdded(voteId: ID!): Vote
  }
`

export function buildServer(resolvers, emitter, pubsub) {
  const app = Fastify()

  app.register(mercurius, {
    schema,
    resolvers,
    subscription: {
      pubsub,
      emitter,
      verifyClient: (info, next) => {
        next(true) // the connection is allowed
      },
    },
  })

  return app
}
