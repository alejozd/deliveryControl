import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InputSwitch } from "primereact/inputswitch";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Paginator } from "primereact/paginator";
import { Toolbar } from "primereact/toolbar";
import config from "../Config";
import axios from "axios";
import "../styles/modules/user-permission.css";

const getFriendlyErrorMessage = (error, fallback = "Ocurrió un error inesperado.") => {
  const rawMessage = String(error?.message || error?.response?.data?.error || "");

  if (rawMessage.includes("Network Error") || rawMessage.includes("Failed to fetch")) {
    return "No se pudo conectar con el servidor. Verifica tu conexión e inténtalo nuevamente.";
  }

  return fallback;
};

const UserPermission = () => {
  const apiUrl = `${config.apiUrl}/Datasnap/rest/TServerMethods1/GetUserPermission`;
  const apiUrlUserPermission = `${config.apiUrl}/Datasnap/rest/TServerMethods1/UserPermission`;

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [pendingChanges, setPendingChanges] = useState([]);
  const toast = useRef(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(apiUrl);
      const result = response?.data?.result || [];
      const usersData = result.map((user) => ({
        idusuario: user.idusuario,
        codigo: user.codigo,
        nombre: user.nombre,
        modvencli: user.modvencli === 1,
      }));

      setUsers(usersData);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "No se pudieron cargar usuarios",
        detail: getFriendlyErrorMessage(error, "No fue posible obtener la lista de permisos."),
        life: 3500,
      });
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;

    return users.filter((user) => {
      const nombre = String(user?.nombre || "").toLowerCase();
      const codigo = String(user?.codigo || "").toLowerCase();
      return nombre.includes(term) || codigo.includes(term);
    });
  }, [searchTerm, users]);

  const paginatedUsers = useMemo(
    () => filteredUsers.slice(first, first + rows),
    [filteredUsers, first, rows]
  );

  const togglePermission = useCallback((user, value) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.idusuario === user.idusuario ? { ...u, modvencli: value } : u
      )
    );

    setPendingChanges((prevChanges) => {
      const existingIndex = prevChanges.findIndex(
        (change) => change.idusuario === user.idusuario
      );

      if (existingIndex >= 0) {
        return prevChanges.map((change, index) =>
          index === existingIndex ? { ...change, modvencli: value ? 1 : 0 } : change
        );
      }

      return [
        ...prevChanges,
        {
          idusuario: user.idusuario,
          modvencli: value ? 1 : 0,
        },
      ];
    });
  }, []);

  const actionTemplate = (rowData) => (
    <div className="user-permission__switch-wrap">
      <InputSwitch
        checked={rowData.modvencli}
        onChange={(e) => togglePermission(rowData, e.value)}
      />
    </div>
  );

  const permissionStatusTemplate = (rowData) => (
    <span className={`user-permission__badge ${rowData.modvencli ? "is-enabled" : "is-disabled"}`}>
      {rowData.modvencli ? "Habilitado" : "Deshabilitado"}
    </span>
  );

  const onSearch = (e) => {
    setSearchTerm(e.target.value);
    setFirst(0);
  };

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  const saveChanges = async () => {
    if (!pendingChanges.length) return;

    try {
      const response = await axios.put(apiUrlUserPermission, pendingChanges);
      if (response.status === 201 || response?.data?.status === 201 || response?.data?.status === 200) {
        toast.current?.show({
          severity: "success",
          summary: "Cambios guardados",
          detail: "Todos los permisos se han actualizado correctamente.",
          life: 3000,
        });
        setPendingChanges([]);
      } else {
        toast.current?.show({
          severity: "error",
          summary: "No se pudo guardar",
          detail: "El servidor no confirmó la actualización de permisos.",
          life: 3000,
        });
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error al guardar",
        detail: getFriendlyErrorMessage(error, "Ocurrió un error al guardar los cambios de permisos."),
        life: 3200,
      });
    }
  };

  const leftToolbar = (
    <div className="user-permission__title-wrap">
      <h2 className="user-permission__title">Permisos de usuarios</h2>
      <p className="user-permission__subtitle">Administra quién puede modificar vendedor desde esta vista.</p>
    </div>
  );

  const rightToolbar = (
    <Button
      label={`Guardar cambios${pendingChanges.length ? ` (${pendingChanges.length})` : ""}`}
      icon="pi pi-save"
      onClick={saveChanges}
      disabled={!pendingChanges.length}
      severity="success"
    />
  );

  return (
    <div className="user-permission card">
      <Toast ref={toast} />

      <Toolbar className="user-permission__toolbar" start={leftToolbar} end={rightToolbar} />

      <div className="user-permission__search-wrap">
        <span className="p-input-icon-left user-permission__search-field">
          <i className="pi pi-search" />
          <InputText
            value={searchTerm}
            onChange={onSearch}
            placeholder="Buscar por nombre o código..."
          />
        </span>
        <span className="user-permission__meta">
          {filteredUsers.length} usuario{filteredUsers.length === 1 ? "" : "s"}
        </span>
      </div>

      <DataTable
        value={paginatedUsers}
        loading={loading}
        className="user-permission__table"
        emptyMessage="No se encontraron usuarios para el filtro aplicado."
        size="small"
        stripedRows
      >
        <Column field="codigo" header="Código" style={{ width: "140px" }} />
        <Column field="nombre" header="Usuario" />
        <Column
          header="Estado"
          body={permissionStatusTemplate}
          style={{ width: "160px", textAlign: "center" }}
        />
        <Column
          body={actionTemplate}
          header="Permitir modificar vendedor"
          style={{ textAlign: "center", width: "240px" }}
        />
      </DataTable>

      <Paginator
        first={first}
        rows={rows}
        totalRecords={filteredUsers.length}
        rowsPerPageOptions={[10, 20, 50]}
        onPageChange={onPageChange}
        className="user-permission__paginator"
      />
    </div>
  );
};

export default UserPermission;
