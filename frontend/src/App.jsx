import { useState } from 'react'
import './App.css'
import SignUp from './components/signUp'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './components/Login'
import MainLayout from './components/MainLayout'
import Home  from './components/Home'
import Profile from './components/Profile'
import { setOnlineUser } from './redux/chatSlice'
import { setSocket } from './redux/socketSlice'
import { useDispatch, useSelector } from 'react-redux'
import ProtectedRoutes from './components/ProtectedRoutes'
import EditProfile from './components/EditProfile'
import ChatPage from './components/ChatPage'

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoutes><MainLayout /></ProtectedRoutes>,
    children: [
      {
        path: '/',
        element: <ProtectedRoutes><Home /></ProtectedRoutes>
      },
      {
        path: '/profile/:id',
        element: <ProtectedRoutes> <Profile /></ProtectedRoutes>
      },
      {
        path: '/account/edit',
        element: <ProtectedRoutes><EditProfile /></ProtectedRoutes>
      },
      {
        path: '/chat',
        element: <ProtectedRoutes><ChatPage /></ProtectedRoutes>
      },
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <SignUp />
  },
])
function App() {
  // const { user } = useSelector(store => store.auth);
  // const { socket } = useSelector(store => store.socketio);
  // const dispatch = useDispatch();

  // useEffect(() => {
  //   if (user) {
  //     const socketio = io('http://localhost:8000', {
  //       query: {
  //         userId: user?._id
  //       },
  //       transports: ['websocket']
  //     });
  //     dispatch(setSocket(socketio));

  //     // listen all the events
  //     socketio.on('getOnlineUsers', (onlineUsers) => {
  //       dispatch(setOnlineUser(onlineUsers));
  //     });

  //     socketio.on('notification', (notification) => {
  //       dispatch(setLikeNotification(notification));
  //     });

  //     return () => {
  //       socketio.close();
  //       dispatch(setSocket(null));
  //     }
  //   } else if (socket) {
  //     socket.close();
  //     dispatch(setSocket(null));
  //   }
  // }, [user, dispatch]);

  return (
    <>
     <RouterProvider router={browserRouter}/>
    </>
  )
}

export default App
