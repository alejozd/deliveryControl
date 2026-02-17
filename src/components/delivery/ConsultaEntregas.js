import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Panel } from "primereact/panel";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import DetalleEntrega from "./DetalleEntrega";
import config from "../../Config";
import axios from "axios";
import setupLocale from "../../config/localeConfig";
import {
  formatDateForApi,
  getFriendlyErrorMessage,
} from "./deliveryUtils";
import "../../styles/modules/delivery.css";

const QUICK_RANGES = [15, 30, 60];

const getDateRange = (days) => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  return [start, end];
};

const createInitialFilters = () => ({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  nombrecliente: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  numeroentrega: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  fechaentrega: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  numfactura: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  fechafactura: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  vendedor: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
});

const ConsultaEntregas = () => {
  const apiUrl = `${config.apiUrl}/Datasnap/rest/TServerMethods1/ListaEntregas`;
  const defaultRange = useMemo(() => getDateRange(15), []);

  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState(defaultRange);
  const [fechaIni, setFechaIni] = useState(defaultRange[0]);
  const [fechaFin, setFechaFin] = useState(defaultRange[1]);
  const [activeQuickRange, setActiveQuickRange] = useState(15);

  const [selectedEntrega, setSelectedEntrega] = useState(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [numeroEntrega, setNumeroEntrega] = useState(null);

  const [errorState, setErrorState] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [filters, setFilters] = useState(createInitialFilters);
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  useEffect(() => {
    setupLocale();
  }, []);

  const handleCloseErrorDialog = () => {
    setErrorState(false);
    setErrorMessage("");
  };

  const handleSearch = useCallback(async () => {
    try {
      setLoading(true);
      const startDate = fechaIni || new Date();
      const endDate = fechaFin || startDate;

      const response = await axios.put(apiUrl, {
        fechaIni: formatDateForApi(startDate),
        fechaFin: formatDateForApi(endDate),
      });

      if (response.data?.status === 200) {
        setEntregas(Array.isArray(response.data.data) ? response.data.data : []);
        return;
      }

      setErrorState(true);
      setErrorMessage(
        response.data?.error ||
          "No fue posible consultar las entregas con los filtros seleccionados."
      );
    } catch (error) {
      setErrorState(true);
      setErrorMessage(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [apiUrl, fechaFin, fechaIni]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const applyQuickRange = (days) => {
    const newRange = getDateRange(days);
    setActiveQuickRange(days);
    setDates(newRange);
    setFechaIni(newRange[0]);
    setFechaFin(newRange[1]);
  };

  const handleDateChange = (e) => {
    const selectedDates = e.value || [];
    setDates(selectedDates);

    if (!selectedDates.length) {
      setFechaIni(null);
      setFechaFin(null);
      setActiveQuickRange(null);
      return;
    }

    const [startDate, endDate] = selectedDates;
    setFechaIni(startDate || null);
    setFechaFin(endDate || startDate || null);

    setActiveQuickRange(null);
  };

  const clearFilter = () => {
    setFilters(createInitialFilters());
    setGlobalFilterValue("");
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setFilters((prevFilters) => ({
      ...prevFilters,
      global: {
        ...prevFilters.global,
        value,
      },
    }));
    setGlobalFilterValue(value);
  };

  const showDetailModal = (entrega) => {
    setSelectedEntrega(entrega.identrega);
    setNumeroEntrega(entrega.numeroentrega);
    setShowDetalleModal(true);
  };

  const onCloseDetalleModal = () => {
    setShowDetalleModal(false);
  };

  const onHide = () => {
    setSelectedEntrega(null);
    setShowDetalleModal(false);
  };

  const header = (
    <div className="flex justify-content-between gap-2 flex-wrap">
      <Button
        type="button"
        icon="pi pi-filter-slash"
        label="Limpiar"
        outlined
        onClick={clearFilter}
      />
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Buscar por cliente, factura, vendedor..."
        />
      </IconField>
    </div>
  );

  return (
    <div className="delivery-page">
      <Panel header="Consulta de Entregas" toggleable>
        <Toolbar
          className="consulta-entregas-toolbar"
          start={
            <div className="consulta-entregas-filters">
              <div className="consulta-entregas-quickranges" role="group">
                {QUICK_RANGES.map((days) => (
                  <Button
                    key={days}
                    type="button"
                    label={`${days} días`}
                    size="small"
                    className={
                      activeQuickRange === days ? "p-button-primary" : "p-button-outlined"
                    }
                    onClick={() => applyQuickRange(days)}
                  />
                ))}
              </div>

              <Calendar
                value={dates}
                onChange={handleDateChange}
                selectionMode="range"
                showIcon
                readOnlyInput
                dateFormat="dd/mm/yy"
                hideOnRangeSelection
                placeholder="Selecciona un rango"
              />
            </div>
          }
          end={
            <Button
              label="Buscar"
              icon="pi pi-search"
              loading={loading}
              onClick={handleSearch}
            />
          }
        />
      </Panel>

      <div className="delivery-list-wrapper">
        <DataTable
          value={entregas}
          loading={loading}
          emptyMessage="No se han encontrado resultados"
          showGridlines
          stripedRows
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          scrollable
          scrollHeight="flex"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
          sortField={["numfactura, fechafactura"]}
          sortOrder={-1}
          filters={filters}
          globalFilterFields={[
            "nombrecliente",
            "numeroentrega",
            "fechaentrega",
            "numfactura",
            "fechafactura",
            "vendedor",
          ]}
          header={header}
        >
          <Column
            field="nombrecliente"
            header="Nombre Cliente"
            sortable
            filter
            filterPlaceholder="Buscar por nombre"
            filterField="nombrecliente"
          />
          <Column
            field="numeroentrega"
            header="Número Entrega"
            sortable
            filter
            filterPlaceholder="Buscar por número de entrega"
            filterField="numeroentrega"
          />
          <Column
            field="fechaentrega"
            header="Fecha Entrega"
            sortable
            filter
            filterPlaceholder="Buscar por fecha de entrega"
            filterField="fechaentrega"
          />
          <Column
            field="numfactura"
            header="Número Factura"
            sortable
            filter
            filterPlaceholder="Buscar por número de factura"
            filterField="numfactura"
          />
          <Column
            field="fechafactura"
            header="Fecha Factura"
            sortable
            filter
            filterPlaceholder="Buscar por fecha de factura"
            filterField="fechafactura"
          />
          <Column
            field="vendedor"
            header="Vendedor"
            sortable
            filter
            filterPlaceholder="Buscar por vendedor"
            filterField="vendedor"
          />
          <Column
            body={(rowData) => (
              <Button
                icon="pi pi-id-card"
                rounded
                text
                size="large"
                onClick={() => showDetailModal(rowData)}
              />
            )}
            header="Detalle"
            bodyStyle={{ textAlign: "center" }}
          />
        </DataTable>
      </div>

      <Dialog
        header={`Entrega ${numeroEntrega}`}
        visible={showDetalleModal}
        onHide={onHide}
      >
        {showDetalleModal && (
          <DetalleEntrega
            idEntrega={selectedEntrega}
            onClose={onCloseDetalleModal}
            entregaData={entregas.find(
              (entrega) => entrega.identrega === selectedEntrega
            )}
          />
        )}
      </Dialog>

      <Dialog
        visible={errorState}
        onHide={handleCloseErrorDialog}
        header="Error"
        modal
        style={{ width: "300px" }}
      >
        <div>
          <p>{errorMessage}</p>
          <Button
            label="Cerrar"
            icon="pi pi-times"
            severity="danger"
            text
            style={{ marginTop: "10px" }}
            size="small"
            onClick={handleCloseErrorDialog}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default ConsultaEntregas;
