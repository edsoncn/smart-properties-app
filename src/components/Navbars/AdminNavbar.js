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
import { useLocation } from "react-router-dom";
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import routes from "routes.js";

const { smartPropertiesLogout } = require("../../configs/apisConfig")
const { removeSessionData } = require("../../configs/authConfig")

function Header({ tenant }) {
  const location = useLocation();
  const userName = sessionStorage.getItem("userName");
  const tenantName = sessionStorage.getItem("tenantName");

  const mobileSidebarToggle = (e) => {
    e.preventDefault();
    document.documentElement.classList.toggle("nav-open");
    var node = document.createElement("div");
    node.id = "bodyClick";
    node.onclick = function () {
      this.parentElement.removeChild(this);
      document.documentElement.classList.toggle("nav-open");
    };
    document.body.appendChild(node);
  };

  const getBrandText = () => {
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].subPaths) {
        for (let j = 0; j < routes[i].subPaths.length; j++) {
          if (location.pathname.indexOf(routes[i].layout + routes[i].path + routes[i].subPaths[j].path.split(':')[0]) !== -1) {
            return routes[i].subPaths[j].fullName ?? routes[i].subPaths[j].name;
          }
        }
      }
      if (location.pathname.indexOf(routes[i].layout + routes[i].path) !== -1) {
        return routes[i].fullName ?? routes[i].name;
      }
    }
    return "Brand";
  };

  const logout = () => {
    smartPropertiesLogout(tenant)
    .then(([status, data]) => {
        if(status === 200){
            removeSessionData();
            window.location = `/${ tenant }/auth/login`;
        }else{
            this.setState({ errorMessage: '(An error occurred during login)' });
            console.log(status + ': ' + JSON.stringify(data));
        }
    })
    .catch((e) => {
        console.log(e);
    });
  }
  return (
    <Navbar bg="light" expand="lg">
      <Container fluid>
        <div className="d-flex justify-content-center align-items-center ms-2 ml-lg-0">
          <Button
            variant="dark"
            className="d-lg-none btn-fill d-flex justify-content-center align-items-center rounded-circle p-2"
            onClick={mobileSidebarToggle}
          >
            <i className="fas fa-ellipsis-v"></i>
          </Button>
          <Navbar.Brand
            href="#home"
            onClick={(e) => e.preventDefault()}
            className="mx-2"
          >
            {tenantName} - {getBrandText()}
          </Navbar.Brand>
        </div>
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="me-2">
          <span className="navbar-toggler-bar burger-lines"></span>
          <span className="navbar-toggler-bar burger-lines"></span>
          <span className="navbar-toggler-bar burger-lines"></span>
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto" navbar>
            <Nav.Item className="nav-separator">
              <Nav.Link
                className="m-0"
                href={`/${ tenant }/admin/profile`}
              >
                <span className="no-icon">{ userName }</span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="nav-separator">
              <Nav.Link
                className="m-0"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                }}
              >
                <span className="no-icon">Log out</span>
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
