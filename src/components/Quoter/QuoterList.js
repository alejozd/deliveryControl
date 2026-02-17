import React, { useEffect, useMemo, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Panel } from "primereact/panel";
import { Toolbar } from "primereact/toolbar";
import { Calendar } from "primereact/calendar";
import { FloatLabel } from "primereact/floatlabel";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { useLocation } from "react-router-dom";
import { Toast } from "primereact/toast";
import axios from "axios";
import config from "../../Config";
import setupLocale from "../../config/localeConfig";
import useExcelExport from "../hooks/useExcelExport";
import PrintQuote from "./PrintQuote";
import Quoter from "./Quoter";
import WhatsAppDialog from "./WhatsAppDialog";
import EmailDialog from "./EmailDialog";
import ComprobantePDF from "./ComprobantePDF";
import "../../styles/modules/quoter-list.css";

const formatDateForApi = (date) =>
  date?.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatCurrency = (value = 0) =>
  Number(value).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
  });

const QuoterList = () => {
  const location = useLocation();
  const toast = useRef(null);
  const { exportToExcel } = useExcelExport("cotizaciones");
  const { user } = location.state || {};

  const apiUrl = `${config.apiUrl}/Datasnap/rest/TServerMethods1/ListaCotizaciones`;
  const apiUrlDelCotizacion = `${config.apiUrl}/Datasnap/rest/TServerMethods1/DeleteCotizacionByID`;
  const apiUrlCotizacionByID = `${config.apiUrl}/Datasnap/rest/TServerMethods1/CotizacionByID`;
  const apiUrlDocumentoUsado = `${config.apiUrl}/Datasnap/rest/TServerMethods1/DocUsado`;

  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [quoters, setQuoters] = useState([]);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState(null);
  const [isWhatsAppModalVisible, setIsWhatsAppModalVisible] = useState(false);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showComprobante, setShowComprobante] = useState(null);

  useEffect(() => {
    setupLocale();
  }, []);

  const fechaIni = startDate || null;
  const fechaFin = endDate || startDate || null;

  const showErrorToast = (message) => {
    setErrorMessage(message);
    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail: message,
      life: 3200,
    });
  };

  const showSuccessToast = (message) => {
    toast.current?.show({
      severity: "success",
      summary: "Completado",
      detail: message,
      life: 2400,
    });
  };

  const filteredQuoters = useMemo(() => {
    const criteria = searchText.trim().toLowerCase();
    if (!criteria) return quoters;

    return quoters.filter((item) =>
      [item.numerocotizacion, item.nit, item.nombrecliente]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(criteria))
    );
  }, [quoters, searchText]);

  const handleSearch = async () => {
    if (!fechaIni || !fechaFin) {
      showErrorToast("Debes seleccionar un rango de fechas válido.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(apiUrl, {
        fechaIni: formatDateForApi(fechaIni),
        fechaFin: formatDateForApi(fechaFin),
      });

      if (response?.data?.status === 200) {
        setQuoters(response.data.data || []);
        setSelectedQuotation(null);
        return;
      }

      showErrorToast(response?.data?.error || "No fue posible cargar cotizaciones.");
    } catch (error) {
      showErrorToast(
        error.message === "Network Error"
          ? "No se puede conectar al servidor. Verifica tu conexión e inténtalo más tarde."
          : `Error al consultar cotizaciones: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExport = async () => {
    const rows = filteredQuoters.map((row) => ({
      numerocotizacion: row.numerocotizacion,
      fechacotizacion: row.fechacotizacion,
      nit: row.nit,
      nombrecliente: row.nombrecliente,
      total: Number(row.total || 0),
    }));

    const success = await exportToExcel(rows, null, {
      fileName: "cotizaciones",
      columnTitles: {
        numerocotizacion: "Número",
        fechacotizacion: "Fecha",
        nit: "Identificación",
        nombrecliente: "Cliente",
        total: "Total",
      },
    });

    if (success) {
      showSuccessToast("Exportación de cotizaciones generada correctamente.");
    }
  };

  const fetchQuotation = async (rowData) => {
    try {
      const response = await axios.put(apiUrlCotizacionByID, {
        idcotizacion: rowData.idcotizacion,
      });

      if (response?.data?.status !== 200) {
        return {
          success: false,
          errorMessage: response?.data?.error || "Error al consultar la cotización.",
        };
      }

      const { cliente, productos } = response.data;
      return {
        success: true,
        quotation: {
          numerocotizacion: cliente.numerocotizacion || "",
          fecha: cliente.fechacotizacion || "",
          cliente: {
            idcliente: cliente.idcliente || "",
            nombre: cliente.nombrecliente || "",
            identidad: cliente.identidad || "",
            direccion: cliente.direccion || "",
            telmovil: cliente.telmovil || "",
            email: cliente.email || "",
            notas: cliente.notas || "",
          },
          productos: (productos || []).map((producto) => ({
            nombre: producto.nombreproductos,
            referencia: producto.referencia,
            precio: producto.precio,
            cantidad: producto.cantidad,
            total: producto.total,
          })),
          total: rowData.total || 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: `Error al consultar la cotización: ${error.message}`,
      };
    }
  };

  const handleSaveQuotation = () => {
    setShowDialog(false);
    setSelectedQuotation(null);
    handleSearch();
  };

  const openCreateDialog = () => {
    setSelectedQuotation(null);
    setShowDialog(true);
  };

  const editQuotation = async (rowData) => {
    try {
      const response = await axios.put(apiUrlDocumentoUsado, {
        documento: rowData.docufull,
        fecha: rowData.fechacotizacion,
      });

      const { docusado, status } = response.data || {};
      if (status !== 200) {
        showErrorToast("No fue posible verificar el estado del documento.");
        return;
      }

      if (docusado === 0) {
        setSelectedQuotation(rowData);
        setShowDialog(true);
        return;
      }

      toast.current?.show({
        severity: "warn",
        summary: "Documento bloqueado",
        detail: `La cotización ${rowData.docufull} ya fue usada y no se puede editar.`,
        life: 3400,
      });
    } catch (error) {
      showErrorToast(`Error al validar el documento: ${error.message}`);
    }
  };

  const confirmDelete = async () => {
    if (!quotationToDelete) return;

    try {
      const response = await axios.put(apiUrlDelCotizacion, {
        idcotizacion: quotationToDelete.idcotizacion,
      });

      if (response?.data?.status === 200) {
        setQuoters((current) =>
          current.filter((item) => item.idcotizacion !== quotationToDelete.idcotizacion)
        );
        setDeleteDialogVisible(false);
        setQuotationToDelete(null);
        showSuccessToast("Cotización eliminada correctamente.");
        return;
      }

      showErrorToast(response?.data?.error || "No fue posible eliminar la cotización.");
    } catch (error) {
      showErrorToast(`Error al eliminar la cotización: ${error.message}`);
    }
  };

  const deleteQuotation = (rowData) => {
    setQuotationToDelete(rowData);
    setDeleteDialogVisible(true);
  };

  const printQuotation = async (rowData) => {
    try {
      setLoading(true);
      const response = await axios.put(apiUrlCotizacionByID, {
        idcotizacion: rowData.idcotizacion,
      });

      if (response?.data?.status !== 200) {
        showErrorToast(response?.data?.error || "No fue posible imprimir la cotización.");
        return;
      }

      const { cliente, productos } = response.data;
      PrintQuote({
        quoteData: {
          numerocotizacion: cliente.numerocotizacion || "",
          fecha: cliente.fechacotizacion || "",
          nombrecliente: cliente.nombrecliente || "",
          identidad: cliente.identidad || "",
          direccion: cliente.direccion || "",
          telmovil: cliente.telmovil || "",
          email: cliente.email || "",
          notas: cliente.notas || "",
          productos: (productos || []).map((item) => ({
            nombreproductos: item.nombreproductos,
            referencia: item.referencia,
            precio: item.precio,
            cantidad: item.cantidad,
            total: item.total,
          })),
        },
      });
    } catch (error) {
      showErrorToast(`Error al imprimir la cotización: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openWhatsAppModal = async (quote) => {
    setLoading(true);
    const { success, quotation, errorMessage: fetchError } = await fetchQuotation(quote);
    setLoading(false);

    if (!success) {
      showErrorToast(fetchError);
      return;
    }

    setSelectedQuote(quotation);
    setIsWhatsAppModalVisible(true);
  };

  const openEmailModal = async (quote) => {
    setLoading(true);
    const { success, quotation, errorMessage: fetchError } = await fetchQuotation(quote);
    setLoading(false);

    if (!success) {
      showErrorToast(fetchError);
      return;
    }

    setSelectedQuote(quotation);
    setIsEmailModalVisible(true);
  };

  const handleShowComprobante = async (rowData) => {
    setLoading(true);
    const { success, quotation, errorMessage: fetchError } = await fetchQuotation(rowData);
    setLoading(false);

    if (!success) {
      showErrorToast(fetchError);
      return;
    }

    setShowComprobante(quotation);
  };

  const actionbodyTemplate = (rowData) => (
    <div className="quoter-actions">
      <Button icon="pi pi-whatsapp" severity="success" rounded text onClick={() => openWhatsAppModal(rowData)} />
      <Button icon="pi pi-envelope" severity="secondary" rounded text onClick={() => openEmailModal(rowData)} />
      <Button icon="pi pi-file-pdf" severity="danger" rounded text onClick={() => handleShowComprobante(rowData)} />
    </div>
  );

  return (
    <div className="quoter-list-page">
      <Toast ref={toast} />

      <Panel header="Cotizaciones" toggleable>
        <Toolbar
          className="quoter-toolbar"
          start={
            <div className="quoter-toolbar__dates">
              <FloatLabel>
                <Calendar
                  id="fechaInicioCotizaciones"
                  value={startDate}
                  onChange={(e) => setStartDate(e.value)}
                  showIcon
                  readOnlyInput
                  dateFormat="dd/mm/yy"
                  placeholder="Fecha inicial"
                  maxDate={endDate || undefined}
                />
                <label htmlFor="fechaInicioCotizaciones">Fecha inicial</label>
              </FloatLabel>

              <FloatLabel>
                <Calendar
                  id="fechaFinCotizaciones"
                  value={endDate}
                  onChange={(e) => setEndDate(e.value)}
                  showIcon
                  readOnlyInput
                  dateFormat="dd/mm/yy"
                  placeholder="Fecha final"
                  minDate={startDate || undefined}
                />
                <label htmlFor="fechaFinCotizaciones">Fecha final</label>
              </FloatLabel>
            </div>
          }
          end={
            <div className="quoter-toolbar__search">
              <IconField iconPosition="left" className="quoter-toolbar__search-field">
                <InputIcon className="pi pi-search" />
                <InputText
                  id="searchCriteria"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Cotización, cédula/nit o nombre"
                />
              </IconField>
              <Button className="quoter-toolbar__action-btn" label="Consultar" icon="pi pi-sync" loading={loading} onClick={handleSearch} />
              <Button className="quoter-toolbar__action-btn" label="Exportar" icon="pi pi-file-excel" severity="success" outlined onClick={handleExport} disabled={!filteredQuoters.length} />
            </div>
          }
        />
      </Panel>

      <Panel className="quoter-list-panel">
        <Toolbar
          end={
            <div className="quoter-main-actions">
              <Button label="Nueva" icon="pi pi-plus" severity="success" onClick={openCreateDialog} raised />
              <Button label="Editar" icon="pi pi-pencil" disabled={!selectedQuotation} onClick={() => editQuotation(selectedQuotation)} />
              <Button label="Eliminar" icon="pi pi-trash" severity="danger" disabled={!selectedQuotation} onClick={() => deleteQuotation(selectedQuotation)} />
              <Button label="Imprimir" icon="pi pi-print" severity="help" disabled={!selectedQuotation} onClick={() => printQuotation(selectedQuotation)} />
            </div>
          }
        />

        <DataTable
          value={filteredQuoters}
          selectionMode="single"
          selection={selectedQuotation}
          onSelectionChange={(e) => setSelectedQuotation(e.value)}
          scrollable
          paginator
          rows={10}
          loading={loading}
          rowsPerPageOptions={[5, 10, 25]}
          emptyMessage="No hay cotizaciones disponibles"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
          className="quoter-table"
        >
          <Column field="idcotizacion" header="ID" hidden />
          <Column field="numerocotizacion" header="Número" sortable style={{ width: "8.5rem" }} />
          <Column field="fechacotizacion" header="Fecha" sortable />
          <Column field="nit" header="Identificación" sortable />
          <Column field="nombrecliente" header="Cliente" sortable />
          <Column field="total" header="Total" body={(row) => formatCurrency(row.total)} sortable align="right" />
          <Column body={actionbodyTemplate} style={{ minWidth: "9rem" }} alignFrozen="right" frozen />
        </DataTable>

        {errorMessage && <small className="quoter-inline-error">{errorMessage}</small>}
      </Panel>

      <Dialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        header={
          selectedQuotation
            ? `Editar Cotización - N° ${selectedQuotation.numerocotizacion}`
            : "Crear Nueva Cotización"
        }
        maximizable
        style={{ width: "80vw" }}
        closeOnEscape={false}
      >
        <Quoter onSave={handleSaveQuotation} quotationData={selectedQuotation} user={user} />
      </Dialog>

      <Dialog
        visible={deleteDialogVisible}
        onHide={() => setDeleteDialogVisible(false)}
        footer={
          <div>
            <Button label="No" icon="pi pi-times" text onClick={() => setDeleteDialogVisible(false)} />
            <Button label="Sí" icon="pi pi-check" onClick={confirmDelete} severity="danger" />
          </div>
        }
        header="Confirmar Eliminación"
        closeOnEscape={false}
      >
        <p className="m-0">
          <i className="pi pi-exclamation-triangle mr-2" style={{ fontSize: "2rem" }}></i>
          ¿Está seguro de eliminar la cotización N° <strong>{selectedQuotation?.numerocotizacion || ""}</strong>?
        </p>
      </Dialog>

      <WhatsAppDialog
        visible={isWhatsAppModalVisible}
        onHide={() => setIsWhatsAppModalVisible(false)}
        selectedQuote={selectedQuote}
      />

      <EmailDialog
        visible={isEmailModalVisible}
        onHide={() => setIsEmailModalVisible(false)}
        selectedQuote={selectedQuote}
      />

      <Dialog
        visible={Boolean(showComprobante)}
        onHide={() => setShowComprobante(null)}
        maximizable
        style={{ width: "80vw", minHeight: "60vh" }}
        closeOnEscape={false}
      >
        {showComprobante && <ComprobantePDF datos={showComprobante} autoGenerate={false} />}
      </Dialog>
    </div>
  );
};

export default QuoterList;
