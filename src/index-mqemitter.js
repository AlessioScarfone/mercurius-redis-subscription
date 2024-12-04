import MQEmitterRedis from 'mqemitter-redis'
import { buildServer } from './server.js'

const emitter = MQEmitterRedis({
  port: 6379,
  host: '127.0.0.1',
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
        await pubsub.publish({
          topic: `VOTE_ADDED_${voteId}`,
          payload: {
            voteAdded: votes[voteId - 1],
          },
        })

        return votes[voteId - 1]
      }

      throw new Error('Invalid vote id')
    },
    voteNo: async (_, { voteId }, { pubsub }) => {
      if (voteId <= votes.length) {
        votes[voteId - 1].noes++
        await pubsub.publish({
          topic: `VOTE_ADDED_${voteId}`,
          payload: {
            voteAdded: votes[voteId - 1],
          },
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
        return pubsub.pubsub.subscribe(`VOTE_ADDED_${voteId}`)
      },
    },
  },
}

const app = buildServer(resolvers, emitter)

emitter.state.on('error', err => {
  console.error(`Custom error handling: ${err}`)
})

console.log('STARTED')

await app.listen({ port: 3000 })
