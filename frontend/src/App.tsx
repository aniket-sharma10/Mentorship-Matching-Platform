import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./common/Header/Header";
import Footer from "./common/Footer/Footer";
import SignUp from "./Pages/SignUp";
import SignIn from "./Pages/SignIn";
import PrivateRoute from "./common/PrivateRoute";
import ProfilePage from "./Pages/Profile";
import Discovery from "./Pages/Discovery";
import Matchmaking from "./Pages/Matchmaking";
import Connections from "./Pages/Connections";
import Home from "./Pages/Home";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/discovery" element={<Discovery />} />
          <Route path="/matchmaking" element={<Matchmaking />} />
          <Route path="/connections" element={<Connections />} />
        </Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
