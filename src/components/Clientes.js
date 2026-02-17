import React, { useCallback, useEffect, useMemo, useState } from "react";
import config from "../Config";
import { Panel } from "primereact/panel";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { classNames } from "primereact/utils";
import { useLocation } from "react-router-dom";
import ClientCreation from "./ClientCreation";
import Potradatos from "./Potradatos";
import translations from "../config/localeConfig";
import axios from "axios";
import { debounce } from "lodash";
import "../styles/modules/clientes.css";

const INITIAL_LAZY_STATE = {
  first: 0,
  rows: 10,
  page: 1,
  sortField: null,
  sortOrder: null,
  filters: {
    nombrecliente: { value: "", matchMode: "contains" },
    identidad: { value: "", matchMode: "startsWith" },
    direccion: { value: "", matchMode: "contains" },
    telmovil: { value: "", matchMode: "startsWith" },
  },
};

const getFriendlyErrorMessage = (error) => {
  const rawMessage = String(error?.message || error || "");

  if (rawMessage.includes("Network Error") || rawMessage.includes("Failed to fetch")) {
    return "No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.";
  }

  return "Ocurrió un error al procesar la solicitud. Inténtalo nuevamente en unos minutos.";
};

const Clientes = () => {
  const location = useLocation();
  const { user } = location.state || {};
  const apiUrl = `${config.apiUrl}/Datasnap/rest/TServerMethods1/ListaClientes`;

  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [errorState, setErrorState] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyState, setLazyState] = useState(INITIAL_LAZY_STATE);

  useEffect(() => {
    translations();
  }, []);

  const loadLazyData = useCallback(async () => {
    setLoading(true);
    try {
      const requestData = {
        criterio: appliedSearchTerm,
        limit: lazyState.rows,
        offset: lazyState.first,
        sortField: lazyState.sortField,
        sortOrder: lazyState.sortOrder,
        filters: lazyState.filters,
      };

      const response = await axios.put(apiUrl, requestData);

      if (response.data?.status === 200) {
        const records = Array.isArray(response.data.data) ? response.data.data : [];
        setClientes(records);
        setTotalRecords(response.data.totalRecords || 0);

        if (selectedCliente) {
          const updatedCliente = records.find(
            (cliente) => cliente.idcliente === selectedCliente.idcliente
          );
          setSelectedCliente(updatedCliente || null);
        }
        return;
      }

      setErrorState(true);
      setErrorMessage(
        response.data?.error || "No fue posible obtener el listado de clientes."
      );
    } catch (error) {
      setErrorState(true);
      setErrorMessage(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [apiUrl, appliedSearchTerm, lazyState, selectedCliente]);

  useEffect(() => {
    loadLazyData();
  }, [loadLazyData]);

  const debouncedFilter = useMemo(
    () =>
      debounce((filters) => {
        setLazyState((prevState) => ({
          ...prevState,
          first: 0,
          page: 1,
          filters,
        }));
      }, 350),
    []
  );

  useEffect(() => () => debouncedFilter.cancel(), [debouncedFilter]);

  const handleAcceptTreatment = (cliente) => {
    setSelectedCliente(cliente);
    setDialogVisible(true);
  };

  const handleCreateCustomer = () => {
    setSelectedCliente(null);
    setEditDialogVisible(true);
  };

  const handleEditCustomer = (cliente) => {
    setSelectedCliente(cliente);
    setEditDialogVisible(true);
  };

  const handleSearch = () => {
    setLazyState((prevState) => ({ ...prevState, first: 0, page: 1 }));
    setAppliedSearchTerm(searchTerm.trim());
  };

  const onPage = (event) => {
    setLazyState((prevState) => ({
      ...prevState,
      first: event.first,
      rows: event.rows,
      page: event.page + 1,
    }));
  };

  const onSort = (event) => {
    setLazyState((prevState) => ({
      ...prevState,
      sortField: event.sortField,
      sortOrder: event.sortOrder,
    }));
  };

  const onFilter = (event) => {
    debouncedFilter(event.filters);
  };

  const verifiedBodyTemplate = (rowData) => (
    <i
      className={classNames("pi", {
        "text-green-500 pi-check-circle": rowData.aceptapotradatos,
        "text-red-500 pi-times-circle": !rowData.aceptapotradatos,
      })}
      onClick={() => rowData.aceptapotradatos === 0 && handleAcceptTreatment(rowData)}
      style={{ cursor: rowData.aceptapotradatos === 0 ? "pointer" : "default" }}
    />
  );

  const handleCustomerCreated = () => {
    loadLazyData();
  };

  const matchModeOptions = [
    { label: "Contiene", value: "contains" },
    { label: "Comienza con", value: "startsWith" },
    { label: "Igual", value: "equals" },
  ];

  const handleCloseErrorDialog = () => {
    setErrorState(false);
    setErrorMessage("");
  };

  return (
    <div className="clientes-page">
      <div className="clientes-header">
        <h1 className="clientes-title">Clientes</h1>
        <span className="clientes-counter">{totalRecords} registros</span>
      </div>

      <Panel header="Listado de Clientes" toggleable className="clientes-panel">
        <Toolbar
          className="clientes-toolbar"
          start={
            <div className="clientes-search-group">
              <InputText
                placeholder="Buscar por nombre o identificación"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="clientes-search-input"
              />
              <Button icon="pi pi-search" label="Buscar" onClick={handleSearch} />
            </div>
          }
          end={
            <div className="clientes-actions">
              <Button
                label="Nuevo"
                icon="pi pi-plus"
                severity="success"
                raised
                onClick={handleCreateCustomer}
              />
              <Button
                label="Editar"
                icon="pi pi-pencil"
                severity="info"
                raised
                disabled={!selectedCliente}
                onClick={() => handleEditCustomer(selectedCliente)}
              />
            </div>
          }
        />

        {selectedCliente ? (
          <div className="clientes-selected">
            <i className="pi pi-user" />
            <span>
              Seleccionado: <strong>{selectedCliente.nombrecliente}</strong>
            </span>
          </div>
        ) : null}
      </Panel>

      <div className="card clientes-table-wrapper">
        <DataTable
          value={clientes}
          lazy
          filterDisplay="row"
          dataKey="idcliente"
          loading={loading}
          stripedRows
          emptyMessage="No se han encontrado resultados"
          paginator
          first={lazyState.first}
          rows={lazyState.rows}
          totalRecords={totalRecords}
          onPage={onPage}
          onSort={onSort}
          sortField={lazyState.sortField}
          sortOrder={lazyState.sortOrder}
          onFilter={onFilter}
          filters={lazyState.filters}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
          rowsPerPageOptions={[10, 20, 50]}
          selection={selectedCliente}
          onSelectionChange={(event) => setSelectedCliente(event.value)}
          responsiveLayout="scroll"
        >
          <Column selectionMode="single" headerStyle={{ width: "3rem" }} />
          <Column hidden field="idcliente" header="ID Cliente" />
          <Column
            field="nombrecliente"
            header="Nombres"
            sortable
            filter
            filterMatchModeOptions={matchModeOptions}
            filterPlaceholder="Buscar"
          />
          <Column
            field="identidad"
            header="Identidad"
            sortable
            filter
            filterMatchModeOptions={matchModeOptions}
            filterPlaceholder="Buscar"
          />
          <Column
            field="direccion"
            header="Dirección"
            sortable
            filter
            filterMatchModeOptions={matchModeOptions}
            filterPlaceholder="Buscar"
          />
          <Column
            field="telmovil"
            header="Teléfono"
            sortable
            filter
            filterMatchModeOptions={matchModeOptions}
            filterPlaceholder="Buscar"
          />
          <Column
            field="aceptapotradatos"
            header="Acepta Política de tratamiento de datos"
            bodyClassName="text-center"
            style={{ width: "10rem", wordWrap: "break-word", textAlign: "center" }}
            body={verifiedBodyTemplate}
          />
        </DataTable>
      </div>

      <Potradatos
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        idCliente={selectedCliente ? selectedCliente.idcliente : null}
        aceptaTratamiento={selectedCliente ? selectedCliente.aceptapotradatos : null}
        onAccept={loadLazyData}
      />

      {editDialogVisible && (
        <ClientCreation
          visible={editDialogVisible}
          onHide={() => setEditDialogVisible(false)}
          onCustomerCreated={handleCustomerCreated}
          selectedCustomer={selectedCliente}
          user={user}
        />
      )}

      <Dialog
        visible={errorState}
        onHide={handleCloseErrorDialog}
        header="Error"
        modal
        style={{ width: "320px" }}
      >
        <p>{errorMessage}</p>
        <Button
          label="Cerrar"
          icon="pi pi-times"
          text
          severity="danger"
          onClick={handleCloseErrorDialog}
        />
      </Dialog>
    </div>
  );
};

export default Clientes;
