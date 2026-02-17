import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import config from "../Config";
import { Panel } from "primereact/panel";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { MultiSelect } from "primereact/multiselect";
import { Tooltip } from "primereact/tooltip";
import { InputSwitch } from "primereact/inputswitch";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Message } from "primereact/message";
import ContactCreation from "./ContactCreation";
import useExcelExport from "./hooks/useExcelExport";
import axios from "axios";
import "../styles/modules/contacto-adicional.css";

const getFriendlyErrorMessage = (error) => {
  const rawMessage = String(error?.message || error || "");

  if (rawMessage.includes("Network Error") || rawMessage.includes("Failed to fetch")) {
    return "No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.";
  }

  return "Ocurrió un error al procesar la solicitud. Inténtalo nuevamente en unos minutos.";
};

const ContactoAdicional = () => {
  const apiUrl = `${config.apiUrl}/Datasnap/rest/TServerMethods1/ListaContactos`;
  const apiUrlSegmentacion = `${config.apiUrl}/Datasnap/rest/TServerMethods1/ListaSegmentacion`;
  const toast = useRef(null);
  const dt = useRef(null);

  const [contactos, setContactos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedContacto, setSelectedContacto] = useState(null);
  const [segmentos, setSegmentos] = useState([]);
  const [selectedSegmentos, setSelectedSegmentos] = useState([]);
  const [exportAllColumns, setExportAllColumns] = useState(false);

  const { exportToExcel } = useExcelExport("contactos_adicionales");

  const columnTitles = {
    idcontacto: "ID de Contacto",
    nombreCa: "Nombre",
    identificacionCa: "Identificación",
    telmovilCa: "Teléfono",
    correoCa: "Email",
    direccionCa: "Dirección",
    nombresegmento: "Segmento",
  };

  const handleSearch = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await axios.put(apiUrl, { criterio: searchTerm });
      if (response.data?.status === 200) {
        setContactos(Array.isArray(response.data.data) ? response.data.data : []);
        return;
      }

      setErrorMessage(response.data?.error || "No se pudo consultar el listado de contactos.");
    } catch (error) {
      setErrorMessage(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [apiUrl, searchTerm]);

  const loadSegmentos = useCallback(async () => {
    try {
      const response = await axios.get(apiUrlSegmentacion);
      setSegmentos(Array.isArray(response.data?.result) ? response.data.result : []);
    } catch (error) {
      toast.current?.show({
        severity: "warn",
        summary: "Segmentos",
        detail: "No fue posible cargar los segmentos de filtro.",
        life: 2800,
      });
    }
  }, [apiUrlSegmentacion]);

  useEffect(() => {
    handleSearch();
    loadSegmentos();
  }, [handleSearch, loadSegmentos]);

  const filteredContactos = useMemo(() => {
    if (!selectedSegmentos.length) {
      return contactos;
    }

    return contactos.filter((contacto) => selectedSegmentos.includes(contacto.nombresegmento));
  }, [contactos, selectedSegmentos]);

  const segmentoFilterTemplate = (options) => {
    const handleSegmentoChange = (e) => {
      const selected = e.value ? e.value.map((segmento) => segmento.nombresegmento) : [];
      setSelectedSegmentos(selected);
      options.filterApplyCallback(selected);
    };

    return (
      <MultiSelect
        value={segmentos.filter((seg) => selectedSegmentos.includes(seg.nombresegmento))}
        options={segmentos}
        onChange={handleSegmentoChange}
        placeholder="Seleccionar Segmentos"
        className="p-column-filter"
        optionLabel="nombresegmento"
        style={{ minWidth: "14rem" }}
        filter
        filterBy="nombresegmento"
        showClear
      />
    );
  };

  const handleCreateContact = () => {
    setSelectedContacto(null);
    setDialogVisible(true);
  };

  const handleEditContact = (contacto) => {
    setSelectedContacto(contacto);
    setDialogVisible(true);
  };

  const deleteContact = async (contacto) => {
    try {
      const response = await axios.delete(
        `${config.apiUrl}/your-endpoint/${contacto.idcontacto}`
      );
      if (response.status === 200) {
        setContactos((prev) => prev.filter((c) => c.idcontacto !== contacto.idcontacto));
        toast.current.show({
          severity: "success",
          summary: "Contacto Eliminado",
          detail: "El contacto fue eliminado correctamente.",
          life: 3000,
        });
      } else {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "No se pudo eliminar el contacto.",
          life: 3000,
        });
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: `Error al eliminar contacto: ${error.message}`,
        life: 3000,
      });
    }
  };

  const handleDeleteContact = (contacto) => {
    setSelectedContacto(contacto);
    confirmDialog({
      message: `¿Estás seguro de que deseas eliminar al contacto ${contacto.nombreCa}?`,
      header: "Confirmación de Eliminación",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sí",
      rejectLabel: "No",
      accept: () => deleteContact(contacto),
    });
  };

  const refreshContacts = (message, severity) => {
    handleSearch();
    toast.current.show({ severity, summary: message, life: 3000 });
  };

  const handleExportExcel = () => {
    const columns = React.Children.toArray(dt.current?.props.children)
      .filter((col) => col.props.field)
      .map((col) => ({
        field: col.props.field,
        hidden: col.props.hidden,
      }));

    exportToExcel(dt.current?.filteredValue || filteredContactos, columns, {
      columnTitles,
      exportAllColumns,
      hiddenColumns: ["idcontacto"],
    });
  };

  return (
    <div className="contacto-adicional-page">
      <Toast ref={toast} />
      <ConfirmDialog />
      <Tooltip target=".export-buttons>button" position="bottom" />

      <div className="contacto-adicional-header">
        <h1 className="contacto-adicional-title">Contactos Adicionales</h1>
        <span className="contacto-adicional-counter">{filteredContactos.length} registros</span>
      </div>

      <Panel header="Listado de Contactos Adicionales" toggleable className="contacto-adicional-panel">
        <Toolbar
          className="contacto-adicional-toolbar"
          start={
            <div className="contacto-adicional-search-group">
              <InputText
                placeholder="Buscar contacto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                tooltip="Buscar contacto por nombre o identificación"
                tooltipOptions={{ position: "top" }}
                className="contacto-adicional-search-input"
              />
              <Button icon="pi pi-search" label="Buscar" onClick={handleSearch} />
            </div>
          }
          end={
            <div className="contacto-adicional-actions">
              <Button label="Nuevo" icon="pi pi-plus" severity="help" outlined raised onClick={handleCreateContact} />
              <Button
                label="Editar"
                icon="pi pi-pencil"
                severity="warning"
                outlined
                raised
                disabled={!selectedContacto}
                onClick={() => handleEditContact(selectedContacto)}
              />
              <Button
                label="Eliminar"
                icon="pi pi-trash"
                severity="danger"
                outlined
                raised
                disabled={!selectedContacto}
                onClick={() => handleDeleteContact(selectedContacto)}
              />
              <Button
                label="Exportar"
                icon="pi pi-file-excel"
                severity="success"
                tooltip="Exportar a Excel"
                outlined
                raised
                onClick={handleExportExcel}
                className="custom-excel-button"
              />
              <div className="contacto-adicional-export-toggle">
                <InputSwitch
                  checked={exportAllColumns}
                  onChange={(e) => setExportAllColumns(e.value)}
                  tooltip="Exportar todas las columnas"
                />
                <label>{exportAllColumns ? "Todas" : "Visibles"}</label>
              </div>
            </div>
          }
        />
      </Panel>

      {errorMessage ? <Message severity="error" text={errorMessage} /> : null}

      <div className="card contacto-adicional-table-wrapper">
        <DataTable
          ref={dt}
          value={filteredContactos}
          dataKey="idcontacto"
          loading={loading}
          stripedRows
          emptyMessage="No se han encontrado resultados"
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          scrollable
          scrollHeight="flex"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
          selection={selectedContacto}
          onSelectionChange={(e) => setSelectedContacto(e.value)}
          filterDisplay="menu"
          responsiveLayout="scroll"
        >
          <Column
            selectionMode="single"
            headerStyle={{ width: "3rem" }}
            bodyStyle={{ width: "3rem", textAlign: "center" }}
          />
          <Column hidden field="idcontacto" header="ID Contacto" sortable />
          <Column field="nombreCa" header="Nombre" sortable />
          <Column field="identificacionCa" header="Identificación" sortable />
          <Column field="telmovilCa" header="Teléfono" sortable />
          <Column field="correoCa" header="Email" sortable />
          <Column field="direccionCa" header="Dirección" sortable />
          <Column
            field="nombresegmento"
            header="Segmento"
            filter
            filterMatchMode="in"
            filterElement={segmentoFilterTemplate}
            filterField="nombresegmento"
            showClearButton={false}
            showApplyButton={false}
            showAddButton={false}
            showFilterMenuOptions={false}
            sortable
          />
        </DataTable>
      </div>

      {dialogVisible && (
        <ContactCreation
          visible={dialogVisible}
          onHide={() => setDialogVisible(false)}
          idCliente={0}
          selectedContact={selectedContacto}
          refreshContacts={refreshContacts}
        />
      )}
    </div>
  );
};

export default ContactoAdicional;
