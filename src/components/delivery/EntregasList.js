import React, { useCallback, useMemo, useState } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { InputNumber } from "primereact/inputnumber";
import { Dialog } from "primereact/dialog";
import { classNames } from "primereact/utils";
import ConfirmationModal from "./ConfirmationModal";
import { PrintDocument } from "./PrintDocument";
import Potradatos from "../Potradatos";
import config from "../../Config";
import {
  formatDateForApi,
  formatDateTimeForApi,
  getFriendlyErrorMessage,
  hasDeliverableItems,
  toNumber,
} from "./deliveryUtils";
import "../../styles/modules/delivery.css";

const buildFormattedDetalle = (detalle = [], quantities = {}) =>
  detalle
    .filter((item) => toNumber(quantities[item.id]) > 0)
    .map((item) => ({
      codigo: item.codigo,
      subcodigo: item.subcodigo,
      nombreproductos: item.nombreproductos,
      consecutivo: item.consecutivo,
      cantfacturada: item.cantfacturada,
      cant_entregada: item.cant_entregada,
      saldo: item.saldo,
      id: item.id,
      cantidad_entregar: toNumber(quantities[item.id]),
    }));

const buildEntregaPayload = ({ factura, quantities, numeroEntrega, notas, fecha }) => ({
  numfactura: factura.numfactura,
  fechafactura: factura.fechafactura,
  idcliente: factura.idcliente,
  nombrecliente: factura.nombrecliente,
  nit: factura.nit,
  direccion: factura.direccion,
  telmovil: factura.telmovil,
  vendedor: factura.vendedor,
  numeroentrega: numeroEntrega,
  fechaEntrega: formatDateTimeForApi(fecha),
  notas,
  detalle: buildFormattedDetalle(factura.detalle, quantities),
});

const formatQuantity = (value) => Number(value || 0).toFixed(2);

const EntregasList = ({
  handleSearch,
  toast,
  products,
  originalProductsCount = 0,
  hasSearched = false,
  onUpdateAceptapotradatos,
  loading,
}) => {
  const getNumEntregaUrl = useMemo(
    () => `${config.apiUrl}/Datasnap/rest/TServerMethods1/GetNumEntrega`,
    []
  );
  const nuevaEntregaUrl = useMemo(
    () => `${config.apiUrl}/Datasnap/rest/TServerMethods1/NuevaEntrega`,
    []
  );

  const [saving, setSaving] = useState(false);
  const [expandedRows, setExpandedRows] = useState([]);
  const [cantidadesEntregar, setCantidadesEntregar] = useState({});
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [numEntrega, setNumEntrega] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [dialogVisibleForClient, setDialogVisibleForClient] = useState(null);

  const closeErrorDialog = useCallback(() => setErrorMessage(""), []);

  const getEntradaNumero = useCallback(async () => {
    const response = await axios.get(getNumEntregaUrl);
    if (response?.data?.status !== 200) {
      throw new Error("No fue posible obtener el número de entrega.");
    }
    return response.data.result?.[0]?.numero;
  }, [getNumEntregaUrl]);

  const markAllDocumentAsDeliverable = useCallback((factura) => {
    const updates = {};
    factura.detalle.forEach((item) => {
      updates[item.id] = item.saldo;
    });
    setCantidadesEntregar((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleTodoButtonClick = useCallback((rowData) => {
    setCantidadesEntregar((prev) => ({
      ...prev,
      [rowData.id]: rowData.saldo,
    }));
  }, []);

  const handleCantidadEntregarInput = useCallback(
    (e, rowData) => {
      const incoming = e.value;
      const parsedIncoming = toNumber(incoming);
      const saldo = toNumber(rowData.saldo);

      if (!incoming) {
        setCantidadesEntregar((prev) => ({ ...prev, [rowData.id]: null }));
        return;
      }

      if (parsedIncoming > saldo) {
        toast.current?.show({
          severity: "warn",
          summary: "Cantidad excede saldo",
          detail: `El valor supera el saldo disponible (${saldo}).`,
          life: 2500,
        });
        setCantidadesEntregar((prev) => ({ ...prev, [rowData.id]: saldo }));
        return;
      }

      setCantidadesEntregar((prev) => ({
        ...prev,
        [rowData.id]: parsedIncoming,
      }));
    },
    [toast]
  );

  const openConfirmationModal = useCallback(
    async (factura) => {
      try {
        setSaving(true);
        const numero = await getEntradaNumero();
        setNumEntrega(numero);
        setSelectedFactura(factura);
        setShowConfirmationModal(true);
      } catch (error) {
        setErrorMessage(getFriendlyErrorMessage(error));
      } finally {
        setSaving(false);
      }
    },
    [getEntradaNumero]
  );

  const handleConfirmEntrega = async (numeroEntrega, notas) => {
    if (!selectedFactura) return { success: false };

    const now = new Date();
    const payload = buildEntregaPayload({
      factura: selectedFactura,
      quantities: cantidadesEntregar,
      numeroEntrega,
      notas,
      fecha: now,
    });

    if (!payload.detalle.length) {
      toast.current?.show({
        severity: "warn",
        summary: "Sin productos",
        detail: "Debes ingresar al menos una cantidad a entregar.",
        life: 2500,
      });
      return { success: false };
    }

    try {
      setSaving(true);
      await axios.put(nuevaEntregaUrl, payload, {
        headers: { "Content-Type": "application/json" },
      });

      PrintDocument({
        factura: {
          ...payload,
          fechaEntrega: formatDateForApi(now),
        },
        isConfirmationModal: true,
      });

      toast.current?.show({
        severity: "success",
        summary: "Entrega registrada",
        detail: `Entrega #${numeroEntrega} generada correctamente.`,
        life: 2800,
      });

      setShowConfirmationModal(false);
      await handleSearch();
      return { success: true, numeroEntrega };
    } catch (error) {
      setErrorMessage(getFriendlyErrorMessage(error));
      return { success: false };
    } finally {
      setSaving(false);
    }
  };

  const allowExpansion = (rowData) =>
    Array.isArray(rowData.detalle) && rowData.detalle.length > 0;

  const renderTodoButton = (rowData) => (
    <Button
      label="Todo"
      onClick={() => handleTodoButtonClick(rowData)}
      outlined
      size="small"
      disabled={toNumber(rowData.saldo) <= 0}
    />
  );

  const renderCantidadEntregar = (rowData) => {
    const saldo = toNumber(rowData.saldo);

    return (
      <InputNumber
        readOnly={saldo <= 0}
        value={cantidadesEntregar[rowData.id] ?? null}
        min={0.01}
        max={saldo}
        onValueChange={(e) => handleCantidadEntregarInput(e, rowData)}
        minFractionDigits={2}
        maxFractionDigits={2}
        locale="es-CO"
        inputClassName="delivery-quantity-input"
      />
    );
  };

  const header = (
    <div className="delivery-expand-controls">
      <small className="delivery-results-counter">
        Mostrando {products.length} de {originalProductsCount} facturas
      </small>
      <Button icon="pi pi-plus" label="Expandir" onClick={() => setExpandedRows(products)} text />
      <Button icon="pi pi-minus" label="Contraer" onClick={() => setExpandedRows([])} text />
    </div>
  );

  const rowExpansionTemplate = (factura) => {
    const acceptIconClassName = classNames({
      "text-green-500 pi pi-check-circle": factura.aceptapotradatos === 1,
      "text-red-500 pi pi-times-circle": factura.aceptapotradatos === 0,
    });

    const deliverDisabled =
      factura.detalle.every((detalle) => toNumber(detalle.saldo) <= 0) ||
      !hasDeliverableItems(factura.detalle, cantidadesEntregar);

    return (
      <div className="p-3 delivery-detail-card">
        <Toolbar
          start={<h3 className="delivery-title">Productos de {factura.numfactura}</h3>}
          center={
            <Button
              label="Tratamiento de datos"
              size="small"
              icon={acceptIconClassName}
              outlined
              onClick={() => setDialogVisibleForClient(factura.idcliente)}
            />
          }
          end={
            <div className="delivery-toolbar-actions">
              <Button
                icon="pi pi-check"
                severity="warning"
                size="small"
                label="Marcar todo"
                outlined
                onClick={() => markAllDocumentAsDeliverable(factura)}
              />
              <Button
                icon="pi pi-send"
                severity="success"
                size="small"
                label="Entregar"
                outlined
                loading={saving}
                disabled={deliverDisabled}
                onClick={() => openConfirmationModal(factura)}
              />
            </div>
          }
        />

        <DataTable value={factura.detalle} dataKey="id" size="small">
          <Column field="nombreproductos" header="Producto" sortable />
          <Column field="referencia" header="Referencia" sortable />
          <Column field="cantfacturada" header="Facturada" sortable body={(row) => formatQuantity(row.cantfacturada)} />
          <Column field="cant_entregada" header="Entregada" sortable body={(row) => formatQuantity(row.cant_entregada)} />
          <Column field="saldo" header="Saldo" sortable body={(row) => formatQuantity(row.saldo)} />
          <Column header="Todo" style={{ width: "6rem" }} body={renderTodoButton} />
          <Column header="Cant. entregar" body={renderCantidadEntregar} />
        </DataTable>

        {dialogVisibleForClient === factura.idcliente && (
          <Potradatos
            visible
            onHide={() => setDialogVisibleForClient(null)}
            idCliente={factura.idcliente}
            aceptaTratamiento={factura.aceptapotradatos}
            onAccept={() => onUpdateAceptapotradatos(factura.idcliente, true)}
          />
        )}
      </div>
    );
  };

  return (
    <div className="delivery-list-wrapper">
      <DataTable
        value={products}
        expandedRows={expandedRows}
        onRowToggle={(e) => setExpandedRows(e.data)}
        rowExpansionTemplate={rowExpansionTemplate}
        header={header}
        emptyMessage={hasSearched ? "No se encontraron facturas para los filtros seleccionados." : "Selecciona filtros y presiona Buscar para consultar facturas."}
        stripedRows
        loading={loading}
        dataKey="numfactura"
      >
        <Column expander={allowExpansion} style={{ width: "4rem" }} />
        <Column field="numfactura" header="Factura" sortable />
        <Column field="fechafactura" header="Fecha" sortable />
        <Column field="nombrecliente" header="Cliente" sortable />
      </DataTable>

      {showConfirmationModal && selectedFactura && (
        <ConfirmationModal
          factura={{
            ...selectedFactura,
            detalle: buildFormattedDetalle(selectedFactura.detalle, cantidadesEntregar),
          }}
          onConfirm={handleConfirmEntrega}
          onCancel={() => setShowConfirmationModal(false)}
          visible={showConfirmationModal}
          numEntrega={numEntrega}
          loading={saving}
        />
      )}

      <Dialog
        visible={Boolean(errorMessage)}
        onHide={closeErrorDialog}
        header="Error"
        modal
        style={{ width: "25rem" }}
      >
        <p>{errorMessage}</p>
        <Button label="Cerrar" icon="pi pi-times" severity="danger" text onClick={closeErrorDialog} />
      </Dialog>
    </div>
  );
};

export default EntregasList;
