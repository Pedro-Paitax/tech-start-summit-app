import { createBrowserRouter, Navigate } from "react-router-dom";

// Imports das páginas
import LoginPage from "./login/LoginPage";
import AgendaPage from "./agenda/AgendaPage";
import BingoPage from "./bingo/BingoPage"; 

// Import do Layout (O "Envelope")
import AppLayout from "../components/layout/AppLayout"; 

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },

  {
    element: <AppLayout />, 
    children: [
      {
        path: "/agenda",
        element: <AgendaPage />,
      },
      {
        path: "/bingo",
        element: <BingoPage />,
      },
    ],
  },

  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  }
]);