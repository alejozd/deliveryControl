import React, { useMemo } from "react";
import { Sidebar } from "primereact/sidebar";
import { PanelMenu } from "primereact/panelmenu";
import { useNavigate } from "react-router-dom";
import packageJson from "../../../package.json";
import {
  FaTruck,
  FaBox,
  FaUsers,
  FaFileAlt,
  FaBriefcase,
  FaClock,
  FaSignOutAlt,
  FaAddressBook,
  FaUserFriends,
  FaKey,
} from "react-icons/fa";
import "../../styles/layout/sidebar.css";

const SideBar = ({ sidebarVisible, setSidebarVisible, user, onLogout }) => {
  const navigate = useNavigate();

  const isAllowedUser = useMemo(() => {
    const allowedUsers = ["ADMINISTRADOR", "SISTEMAS"];
    return user && allowedUsers.includes(user.name);
  }, [user]);

  const goTo = (path, options) => {
    setSidebarVisible(false);
    navigate(path, options);
  };

  const items = [
    {
      label: "Gestión",
      items: [
        {
          label: "Entregas",
          icon: <FaTruck className="custom-icon" />,
          command: () => goTo("/entregas"),
        },
        {
          label: "Productos",
          icon: <FaBox className="custom-icon" />,
          command: () => goTo("/productos"),
        },
      ],
    },
    {
      label: "Consultas",
      items: [
        {
          label: "Consulta Entregas",
          icon: <FaBriefcase className="custom-icon" />,
          command: () => goTo("/consultaentregas"),
        },
        {
          label: "Pendientes por Entregar",
          icon: <FaClock className="custom-icon" />,
          command: () => goTo("/consultapendientes"),
        },
      ],
    },
    {
      label: "Reportes",
      icon: "pi pi-chart-bar",
      items: [
        {
          label: "Dashboard Ventas",
          icon: "pi pi-chart-line",
          command: () => goTo("/salesdashboard"),
        },
      ],
    },
    {
      label: "Administración",
      items: [
        {
          label: "Clientes",
          icon: <FaUsers className="custom-icon" />,
          command: () => goTo("/clientes", { state: { user } }),
        },
        {
          label: "Contactos",
          icon: <FaAddressBook className="custom-icon" />,
          command: () => goTo("/contactoadicional"),
        },
        {
          label: "Asociar Clientes y Contactos",
          icon: <FaUserFriends className="custom-icon" />,
          command: () => goTo("/clientcontactassociation"),
        },
        {
          label: "Cotizaciones",
          icon: <FaFileAlt className="custom-icon" />,
          command: () => goTo("/quoterlist", { state: { user } }),
        },
      ],
    },
    {
      label: "Configuración",
      items: [
        {
          label: "Permisos de usuario",
          icon: <FaKey className="custom-icon" />,
          command: () => goTo("/userpermission"),
          visible: isAllowedUser,
        },
      ],
    },
    {
      label: "Cerrar Sesión",
      icon: <FaSignOutAlt className="custom-icon" />,
      command: () => {
        setSidebarVisible(false);
        onLogout();
      },
    },
  ];

  return (
    <Sidebar
      visible={sidebarVisible}
      position="left"
      onHide={() => setSidebarVisible(false)}
      className="app-sidebar"
      header={
        <div className="app-sidebar__header">
          <span className="app-sidebar__title">Control de Entregas</span>
          <small>Versión {packageJson.version}</small>
        </div>
      }
    >
      <PanelMenu model={items} className="app-panelmenu" />
    </Sidebar>
  );
};

export default SideBar;
