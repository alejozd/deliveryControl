import React, { useEffect, useMemo, useState } from "react";
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
import "./SideBar.css";

const SideBar = ({ sidebarVisible, user, onLogout }) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const version = `Versión ${packageJson.version}`;

  useEffect(() => {
    setVisible(Boolean(sidebarVisible));
  }, [sidebarVisible]);

  const isAllowedUser = useMemo(() => {
    const allowedUsers = ["ADMINISTRADOR", "SISTEMAS"];
    return user && allowedUsers.includes(user.name);
  }, [user]);

  const goTo = (path, options) => {
    setVisible(false);
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
          setVisible(false);
          onLogout();
        },
      },
    ];

  return (
    <div className="sidebar-wrapper">
      <Sidebar
        visible={visible}
        position="left"
        onHide={() => setVisible(false)}
        className="app-sidebar"
        header={
          <div className="app-sidebar__header">
            <span className="app-sidebar__title">Control de Entregas</span>
            <small>{version}</small>
          </div>
        }
      >
        <PanelMenu model={items} className="app-panelmenu" />
      </Sidebar>
    </div>
  );
};

export default SideBar;
