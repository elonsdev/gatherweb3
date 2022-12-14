import { enableMapSet } from 'immer'
import { configureStore } from '@reduxjs/toolkit'
import userReducer from './UserStore'
import computerReducer from './ComputerStore'
import whiteboardReducer from './WhiteboardStore'
import videoscreenReducer from './VideoscreenStore'
import youtubescreenReducer from './YoutubescreenStore'
import philbotscreenReducer from './PhilbotscreenStore'
import pooltableReducer from './PooltableStore'
import nftmintReducer from './NftmintStore'
import chatReducer from './ChatStore'
import roomReducer from './RoomStore'
 
enableMapSet()

const store = configureStore({
  reducer: {
    user: userReducer,
    computer: computerReducer,
    whiteboard: whiteboardReducer,
    videoscreen: videoscreenReducer,
    youtubescreen: youtubescreenReducer,
    philbotscreen: philbotscreenReducer,
    pooltable: pooltableReducer,
    nftmint: nftmintReducer,
    chat: chatReducer,
    room: roomReducer,
  },
  // Temporary disable serialize check for redux as we store MediaStream in ComputerStore.
  // https://stackoverflow.com/a/63244831
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default store
