import React, { useState, useEffect } from "react";
import { InputSwitch } from "primereact/inputswitch";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Paginator } from "primereact/paginator";
import config from "../Config";
import axios from "axios";

const UserPermission = () => {
  const apiUrl = `${config.apiUrl}/Datasnap/rest/TServerMethods1/GetUserPermission`;
  const apiUrlUserPermission = `${config.apiUrl}/Datasnap/rest/TServerMethods1/UserPermission`;
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pendingChanges, setPendingChanges] = useState([]); // Lista de cambios pendientes
  const toast = React.useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(apiUrl);
        const usersData = response.data.result.map((user) => ({
          idusuario: user.idusuario,
          codigo: user.codigo,
          nombre: user.nombre,
          modvencli: user.modvencli === 1, // Convertimos 1/0 en true/false para InputSwitch
        }));
        setUsers(usersData);
        setFilteredUsers(usersData);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar los usuarios:", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Función para manejar el cambio local de permisos sin guardar aún
  const togglePermission = (user, value) => {
    const updatedUsers = users.map((u) =>
      u.idusuario === user.idusuario ? { ...u, modvencli: value } : u
    );
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);

    // Agregamos o actualizamos el cambio en la lista de cambios pendientes
    const updatedChanges = [...pendingChanges];
    const existingChangeIndex = updatedChanges.findIndex(
      (change) => change.idusuario === user.idusuario
    );

    if (existingChangeIndex >= 0) {
      updatedChanges[existingChangeIndex].modvencli = value ? 1 : 0;
    } else {
      updatedChanges.push({
        idusuario: user.idusuario,
        modvencli: value ? 1 : 0,
      });
    }

    setPendingChanges(updatedChanges);
  };

  const actionTemplate = (rowData) => {
    return (
      <InputSwitch
        checked={rowData.modvencli}
        onChange={(e) => togglePermission(rowData, e.value)}
      />
    );
  };

  const onSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredUsers(
      users.filter((user) => user.nombre.toLowerCase().includes(term))
    );
  };

  const onPageChange = (event) => {
    setPage(event.first / rowsPerPage);
  };

  // Función para guardar los cambios pendientes
  const saveChanges = async () => {
    try {
      console.log("pendingChanges:", pendingChanges);
      const response = await axios.put(apiUrlUserPermission, pendingChanges);
      console.log("response:", response);
      if (response.status === 201) {
        toast.current.show({
          severity: "success",
          summary: "Cambios guardados",
          detail: "Todos los permisos se han actualizado correctamente.",
          life: 3000,
        });
        setPendingChanges([]); // Limpiar los cambios pendientes
      } else {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "No se pudieron guardar los cambios",
          life: 3000,
        });
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Ocurrió un error al guardar los cambios",
        life: 3000,
      });
    }
  };

  return (
    <div className="card">
      <h2>Permisos de Usuarios</h2>
      <Toast ref={toast} />
      <div style={{ marginBottom: "20px" }}>
        <InputText
          value={searchTerm}
          onChange={onSearch}
          placeholder="Buscar usuario..."
          style={{ width: "100%" }}
        />
      </div>
      <DataTable
        value={filteredUsers.slice(
          page * rowsPerPage,
          (page + 1) * rowsPerPage
        )}
        loading={loading}
      >
        <Column field="nombre" header="Usuario" />
        <Column
          body={actionTemplate}
          header="Puede Modificar Vendedor"
          style={{ textAlign: "center", width: "10em" }}
        />
      </DataTable>
      <Paginator
        first={page * rowsPerPage}
        rows={rowsPerPage}
        totalRecords={filteredUsers.length}
        rowsPerPageOptions={[10, 20, 50]}
        onPageChange={onPageChange}
        style={{ marginTop: "20px" }}
      />
      <div style={{ marginTop: "20px" }}>
        <Button
          label="Guardar Cambios"
          icon="pi pi-save"
          onClick={saveChanges} // Se ejecuta al hacer clic
          disabled={pendingChanges.length === 0} // Deshabilitado si no hay cambios
        />
      </div>
    </div>
  );
};

export default UserPermission;
