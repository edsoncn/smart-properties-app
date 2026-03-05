/*!

=========================================================
* Light Bootstrap Dashboard React - v2.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/light-bootstrap-dashboard-react
* Copyright 2020 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
import { useLocation, Route, Navigate, Routes } from "react-router-dom";
import { useParams } from "react-router-dom";

import AdminNavbar from "components/Navbars/AdminNavbar";
import Footer from "components/Footer/Footer";
import Sidebar from "components/Sidebar/Sidebar";

import routes from "routes.js";

import sidebarImage from "./../assets/img/sidebar-3.jpg";

const { isLoggedIn } = require("../configs/authConfig") 

function Admin() {
  const [image, setImage] = React.useState(sidebarImage);
  const [color, setColor] = React.useState("black");
  const [hasImage, setHasImage] = React.useState(true);
  const location = useLocation();
  const mainPanel = React.useRef(null);
  const { tenant } = useParams();

  const getRoutes = (routes) => {
    let routesList = [];

    if( !isLoggedIn() ){
      return <Navigate to={"/" + tenant + "/auth/login"} />;
    }
    
    routes.map((prop, key) => {
      if (prop.layout === "/admin" && !prop.disabled) {
        if(prop.subPaths) {
          prop.subPaths.map((subProp, subKey) => {
            routesList.push(
              <Route
                path={prop.path + subProp.path}
                element={<subProp.component tenant={tenant} />}
                key={key + "_" + subKey}
              />
            )
          })
        }
        routesList.push(
          <Route
            path={prop.path}
            element={<prop.component tenant={tenant} />}
            key={key}
          />
        )
      } else {
        return null;
      }
    });

    return routesList.map((route) => route);
  };
  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainPanel.current.scrollTop = 0;
    if (
      window.innerWidth < 993 &&
      document.documentElement.className.indexOf("nav-open") !== -1
    ) {
      document.documentElement.classList.toggle("nav-open");
      var element = document.getElementById("bodyClick");
      element.parentNode.removeChild(element);
    }
  }, [location]);
  return (
    <>
      <div className="wrapper">
        <Sidebar color={color} image={hasImage ? image : ""} routes={routes} tenant={tenant} />
        <div className="main-panel" ref={mainPanel}>
          <AdminNavbar tenant={tenant} />
          <div className="content">
            <Routes>{getRoutes(routes)}</Routes>
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}

export default Admin;
