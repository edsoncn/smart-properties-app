import React from "react";

import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/animate.min.css";
import "./assets/scss/light-bootstrap-dashboard-react.scss?v=2.0.0";
import "./assets/css/demo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { createRoot } from 'react-dom/client';

import AdminLayout from "layouts/Admin.js";
import AuthLayout from "layouts/Auth.js";

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);


root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/:tenant/admin/*" element={<AdminLayout />} />
      <Route path="/:tenant/auth/*" element={<AuthLayout />} />
      <Route path="/:tenant/*" element={<Navigate to="/smartproperties/auth/login" replace />} />
      <Route path="/*" element={<Navigate to="/smartproperties/auth/login" replace />} />
    </Routes>
  </BrowserRouter>
);
