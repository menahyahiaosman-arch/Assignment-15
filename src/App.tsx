import { createBrowserRouter, Navigate } from "react-router";
import AuthLayout from "./Layout/Authlayout";
import Login from "./bages/login/login";
import Register from "./bages/Register/Register";
import { RouterProvider } from "react-router";
import Mainlayout from "./Layout/Mainlayout";
import Newsfeed from "./bages/Newsfeed/Newsfeed";
import Notefication from "./bages/Notefication/Notefication";
import Notfound from "./bages/Notfound/Notfound";
import Profile from "./bages/Profile/Profile";
import { Toaster } from "react-hot-toast";
import AppProtectedRoutes from "./commponents/ProtectedRoutes/AppProtectedRoutes";
import PostDetails from "./bages/PostDetails/PostDetails";
import CollectionPage from "./bages/CollectionPage";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Settings from "./bages/Settings/Settings";
import Suggestions from "./bages/Suggetions/Suggestions";
export default function App() {
  const routes = createBrowserRouter([
    {
      path: "/auth",
      element: <AppProtectedRoutes><AuthLayout /></AppProtectedRoutes>,
      children: [
        { index: true, element: <Navigate to="login" /> },
        { path: "login", element: <Login /> },
        { path: "register", element: <Register /> },
      ],
    },
    {
      path: "",
      element:<AppProtectedRoutes><Mainlayout /></AppProtectedRoutes> ,
      children: [
        { index: true, element: <Navigate to="feed" /> },
        { path: "feed", element: <Newsfeed /> },
        { path: "posts", element: <CollectionPage mode="posts" /> },
        { path: "saved", element: <CollectionPage mode="saved" /> },
        { path: "community", element: <CollectionPage mode="community" /> },
        { path: "profile", element: <Profile /> },
        { path: "notefication", element: <Notefication /> },
        {path: "postDetailes/:id", element: <PostDetails/>},
        {path:"settings" ,element:<Settings />},
        { path: "suggestions", element: <Suggestions /> }
        
      ],
    },
     { path: "*", element: <Notfound /> },
  ]);

  return (
    <>
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false}/>
      <RouterProvider router={routes} />
    </>
  );
}
