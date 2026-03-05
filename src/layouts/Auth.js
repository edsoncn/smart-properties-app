import React from "react";
import { useLocation, Route, Navigate, Routes } from "react-router-dom";
import { useParams } from "react-router-dom";
import Footer from "components/Footer/Footer";
import routes from "routes.js";

const { isLoggedIn } = require("../configs/authConfig");

function Auth() {
  const location = useLocation();
  const { tenant } = useParams();

  React.useEffect(() => {}, [location]);
  if( isLoggedIn() ){
    return (<Navigate to={"/" + tenant + "/admin/smart-properties"} />)
  }
  
  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/auth" && !prop.disabled) {
        return (
          <Route
            path={prop.path}
            element={<prop.component tenant={tenant} />}
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };
  return (
    <>
      <div className="wrapper">
          <div className="content">
            <Routes>{getRoutes(routes)}</Routes>
          </div>
          <Footer />
      </div>
    </>
  );
}

export default Auth;