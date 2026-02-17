import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Panel } from "primereact/panel";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputSwitch } from "primereact/inputswitch";
import config from "../../Config";
import axios from "axios";
import setupLocale from "../../config/localeConfig";
import useExcelExport from "../hooks/useExcelExport";
import { formatDateForApi, getFriendlyErrorMessage, toNumber } from "./deliveryUtils";
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
  numfactura: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  referencia: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  nombreproducto: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  nombrecliente: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  vendedor: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  saldo: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  identidad: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
});

const ConsultaPendientesEntrega = () => {
  const apiUrl = `${config.apiUrl}/Datasnap/rest/TServerMethods1/ListaRefEntregar`;
  const toast = useRef(null);
  const dt = useRef(null);
  const uniqueIdCounter = useRef(0);

  const defaultRange = useMemo(() => getDateRange(15), []);

  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState(defaultRange);
  const [fechaIni, setFechaIni] = useState(defaultRange[0]);
  const [fechaFin, setFechaFin] = useState(defaultRange[1]);
  const [activeQuickRange, setActiveQuickRange] = useState(15);

  const [errorState, setErrorState] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [filters, setFilters] = useState(createInitialFilters);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [exportAllColumns, setExportAllColumns] = useState(false);
  const { exportToExcel } = useExcelExport("pendientes_entrega");

  const columnTitles = {
    numfactura: "Documento",
    referencia: "Referencia",
    nombreproducto: "Nombre Artículo",
    vendedor: "Vendedor",
    saldo: "Cant. Pendiente",
    nombrecliente: "Cliente",
    identidad: "Identidad",
  };

  useEffect(() => {
    setupLocale();
  }, []);

  const generateUniqueId = useCallback(() => {
    uniqueIdCounter.current += 1;
    return `unique-id-${uniqueIdCounter.current}`;
  }, []);

  const handleCloseErrorDialog = () => {
    setErrorState(false);
    setErrorMessage("");
  };

  const handleSearch = useCallback(async () => {
    try {
      setLoading(true);
      const fechaInicio = fechaIni || new Date();
      const fechaFinal = fechaFin || fechaInicio;

      const response = await axios.put(apiUrl, {
        fechaIni: formatDateForApi(fechaInicio),
        fechaFin: formatDateForApi(fechaFinal),
      });

      if (response.data?.status === 200) {
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        const dataWithIds = data.map((item) => ({
          ...item,
          id: generateUniqueId(),
        }));
        setPendientes(dataWithIds);
        return;
      }

      setErrorState(true);
      setErrorMessage(
        response.data?.error ||
          "No fue posible consultar referencias pendientes con este rango de fechas."
      );
    } catch (error) {
      setErrorState(true);
      setErrorMessage(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [apiUrl, fechaFin, fechaIni, generateUniqueId]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

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

  const applyQuickRange = (days) => {
    const newRange = getDateRange(days);
    setActiveQuickRange(days);
    setDates(newRange);
    setFechaIni(newRange[0]);
    setFechaFin(newRange[1]);
  };

  const handleExportExcel = () => {
    const columns = React.Children.toArray(dt.current?.props.children)
      .filter((col) => col.props.field)
      .map((col) => ({
        field: col.props.field,
        hidden: col.props.hidden,
      }));

    exportToExcel(dt.current?.filteredValue || pendientes, columns, {
      columnTitles,
      exportAllColumns,
      hiddenColumns: ["id"],
    });
  };

  const clearFilter = () => {
    setFilters(createInitialFilters());
    setGlobalFilterValue("");
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setFilters((prevFilters) => ({
      ...prevFilters,
      global: { ...prevFilters.global, value },
    }));
    setGlobalFilterValue(value);
  };

  const onRowSelect = (event) => {
    toast.current?.show({
      severity: "info",
      summary: "Producto seleccionado",
      detail: event.data.nombreproducto,
      life: 2500,
    });
  };

  const stockBodyTemplate = (rowData) => {
    const saldo = toNumber(rowData.saldo);

    const stockClassName = classNames(
      "border-circle w-4rem h-2rem inline-flex font-bold justify-content-center align-items-center text-sm",
      {
        "bg-teal-100 text-teal-900": saldo > 1 && saldo < 10,
        "bg-blue-100 text-blue-900": saldo >= 10 && saldo < 20,
        "bg-red-100 text-red-900": saldo >= 20,
      }
    );

    return <div className={stockClassName}>{saldo.toFixed(2)}</div>;
  };

  const header = (
    <div className="flex justify-content-between align-items-center gap-2 flex-wrap">
      <Button
        type="button"
        icon="pi pi-filter-slash"
        label="Limpiar"
        outlined
        onClick={clearFilter}
      />
      <div className="flex align-items-center gap-2 flex-wrap">
        <div className="flex align-items-center gap-1">
          <InputSwitch
            checked={exportAllColumns}
            onChange={(e) => setExportAllColumns(e.value)}
            tooltip="Exportar todas las columnas"
          />
          <label className="text-sm">{exportAllColumns ? "Todas" : "Visibles"}</label>
        </div>
        <Button
          icon="pi pi-file-excel"
          severity="success"
          label="Exportar"
          tooltip="Exportar a Excel"
          outlined
          raised
          onClick={handleExportExcel}
        />
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Buscar por documento, artículo, cliente..."
          />
        </IconField>
      </div>
    </div>
  );

  return (
    <div className="delivery-page">
      <Panel header="Consulta Referencias Pendientes por Entregar" toggleable>
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
                numberOfMonths={2}
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

      <Toast ref={toast} />

      <div className="delivery-list-wrapper">
        <DataTable
          ref={dt}
          value={pendientes}
          emptyMessage="No se han encontrado resultados"
          loading={loading}
          dataKey="id"
          showGridlines
          stripedRows
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          filters={filters}
          globalFilterFields={[
            "numfactura",
            "referencia",
            "nombreproducto",
            "nombrecliente",
            "saldo",
            "identidad",
          ]}
          header={header}
          columnResizeMode="fit"
          scrollable
          scrollHeight="flex"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
          selectionMode="single"
          selection={selectedProduct}
          onSelectionChange={(e) => setSelectedProduct(e.value)}
          onRowSelect={onRowSelect}
          metaKeySelection={false}
          tableStyle={{ minWidth: "50rem" }}
          removableSort
          rowGroupMode="rowspan"
          groupRowsBy="numfactura"
          sortMode="single"
          sortField="numfactura"
          sortOrder={0}
        >
          <Column
            field="numfactura"
            header="Documento"
            filter
            filterPlaceholder="Buscar por documento"
            filterField="numfactura"
            sortable
          />
          <Column
            field="referencia"
            header="Referencia"
            filter
            filterPlaceholder="Buscar por referencia"
            filterField="referencia"
            sortable
          />
          <Column
            field="nombreproducto"
            header="Nombre Articulo"
            filter
            filterPlaceholder="Buscar por nombre"
            filterField="nombreproducto"
            sortable
          />
          <Column
            field="vendedor"
            header="Vendedor"
            filter
            filterPlaceholder="Buscar por nombre"
            filterField="vendedor"
            sortable
          />
          <Column
            field="saldo"
            header="Cant. Pendiente"
            filter
            filterPlaceholder="Buscar por saldo"
            filterField="saldo"
            sortable
            body={stockBodyTemplate}
            align="center"
          />
          <Column
            field="nombrecliente"
            header="Cliente"
            filter
            filterPlaceholder="Buscar por nombre"
            filterField="nombrecliente"
            sortable
          />
          <Column
            field="identidad"
            header="Identidad"
            filter
            filterPlaceholder="Buscar por identidad"
            filterField="identidad"
            sortable
          />
        </DataTable>
      </div>

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

export default ConsultaPendientesEntrega;
