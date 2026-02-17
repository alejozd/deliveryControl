import React from "react";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Avatar } from "primereact/avatar";
import { Tag } from "primereact/tag";
import logo from "../../resources/images/logo-metro.png";
import "../../styles/layout/navbar.css";

function NavBar({ setSidebarVisible, user, empresa }) {
  const handleSidebarToggle = () => {
    setSidebarVisible((prev) => !prev);
  };

  return (
    <Toolbar
      className="app-navbar"
      start={
        <div className="app-navbar__start">
          <Button
            icon="pi pi-bars"
            rounded
            text
            aria-label="Mostrar menú lateral"
            onClick={handleSidebarToggle}
          />
          <img src={logo} alt="Metro" className="app-navbar__logo" />
          <span className="app-navbar__title">Control de Entregas</span>
        </div>
      }
      center={
        <Tag
          severity="info"
          value={`${empresa?.nombre || "Empresa"} (${empresa?.codigo || "---"})`}
          className="app-navbar__company"
        />
      }
      end={
        <div className="app-navbar__end">
          <div className="app-navbar__user-info">
            <small>Usuario</small>
            <strong>{user?.name || "Invitado"}</strong>
          </div>
          <Avatar
            icon="pi pi-user"
            shape="circle"
            size="large"
            className="app-navbar__avatar"
          />
        </div>
      }
    />
  );
}

export default NavBar;
