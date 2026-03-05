
import Dashboard from "views/Dashboard.js";
import Login from "views/Login.js"
import TenantManagement from "views/TenantManagement.js"
import UserManagement from "views/UserManagement.js"
import WorkspaceManagement from "views/WorkspaceManagement.js"
import SmartPropertiesHomeManagement from "views/SmartPropertiesHomeManagement.js"
import SmartPropertiesManagement from "views/SmartPropertiesManagement.js";
import UserProfile from "views/UserProfile.js";

const dashboardRoutes = [
  {
    path: "/login",
    name: "Login",
    icon: "nc-icon nc-single-02",
    component: Login,
    layout: "/auth",
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-chart-pie-35",
    component: Dashboard,
    roles: ['super-admin', 'admin', 'operator'],
    layout: "/admin",
    disabled: true
  },
  {
    path: "/smart-properties",
    name: "Smart Properties",
    fullName: "Smart Properties Home",
    icon: "nc-icon nc-single-copy-04",
    component: SmartPropertiesHomeManagement,
    roles: ['super-admin', 'admin', 'operator', 'tester'],
    layout: "/admin",
    subPaths: [
      {
        path: "/:workspace",
        name: "Smart Properties Management",
        icon: "nc-icon nc-single-copy-04",
        component: SmartPropertiesManagement
      }
    ]
  },
  {
    path: "/tenant",
    name: "Tenants",
    icon: "nc-icon nc-bank",
    component: TenantManagement,
    roles: ['super-admin'],
    layout: "/admin",
  },
  {
    path: "/workspace",
    name: "Workspaces",
    icon: "nc-icon nc-grid-45",
    component: WorkspaceManagement,
    roles: ['super-admin', 'admin'],
    layout: "/admin"
  },
  {
    path: "/user",
    name: "Users",
    icon: "nc-icon nc-single-02",
    component: UserManagement,
    roles: ['super-admin', 'admin'],
    layout: "/admin",
  },
  {
    path: "/profile",
    name: "User Profile",
    icon: "nc-icon nc-circle-09",
    roles: ['super-admin', 'admin', 'operator', 'tester'],
    component: UserProfile,
    layout: "/admin",
  }
];

export default dashboardRoutes;