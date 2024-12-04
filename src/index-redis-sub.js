import { RedisPubSub } from 'graphql-redis-subscriptions'
import { buildServer } from './server.js'

const redisPubSub = new RedisPubSub({
  connection: {
    maxRetriesPerRequest: 5,
  },
  connectionListener: err => {
    console.log('CONNECT LISTENER: ', err ?? 'connected')
  },
})

const votes = [
  {
    id: '0',
    title: 'Voto 0',
    ayes: 0,
    noes: 0,
  },
]

const resolvers = {
  Query: {
    votes: async () => votes,
  },
  Mutation: {
    voteAye: async (_, { voteId }, { pubsub }) => {
      if (voteId <= votes.length) {
        votes[voteId - 1].ayes++
        await pubsub.publish(`VOTE_ADDED_${voteId}`, {
          voteAdded: votes[voteId - 1],
        })

        return votes[voteId - 1]
      }

      throw new Error('Invalid vote id')
    },
    voteNo: async (_, { voteId }, { pubsub }) => {
      if (voteId <= votes.length) {
        votes[voteId - 1].noes++
        await pubsub.publish(`VOTE_ADDED_${voteId}`, {
          voteAdded: votes[voteId - 1],
        })

        return votes[voteId - 1]
      }

      throw new Error('Invalid vote id')
    },
  },
  Subscription: {
    voteAdded: {
      subscribe: async (root, { voteId }, { pubsub }) => {
        // subscribe only for a vote with a given id
        return pubsub.pubsub.asyncIterator(`VOTE_ADDED_${voteId}`)
      },
    },
  },
}

const app = buildServer(resolvers, null, redisPubSub)

console.log('STARTED')

await app.listen({ port: 3000 })
