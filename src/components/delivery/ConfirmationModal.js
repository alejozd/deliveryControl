import React, { useEffect, useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputTextarea } from "primereact/inputtextarea";
import { Tag } from "primereact/tag";
import "../../styles/modules/delivery.css";

const formatNumber = (value) => Number(value || 0).toFixed(2);

const ConfirmationModal = ({
  factura,
  onConfirm,
  onCancel,
  visible,
  numEntrega,
  loading,
}) => {
  const [notas, setNotas] = useState("");

  useEffect(() => {
    if (visible) {
      setNotas("");
    }
  }, [visible]);

  const totals = useMemo(() => {
    const items = factura?.detalle || [];
    const totalLineas = items.length;
    const totalCantidad = items.reduce(
      (sum, item) => sum + Number(item.cantidad_entregar || 0),
      0
    );

    return { totalLineas, totalCantidad };
  }, [factura]);

  const handleConfirm = async () => {
    await onConfirm(numEntrega, notas.trim());
  };

  return (
    <Dialog
      header={`Confirmar entrega #${numEntrega} · Factura ${factura.numfactura}`}
      visible={visible}
      style={{ width: "56rem", maxWidth: "95vw" }}
      breakpoints={{ "960px": "95vw", "641px": "100vw" }}
      onHide={onCancel}
      className="delivery-confirmation-modal"
      position="top"
      footer={
        <div className="delivery-confirmation-footer">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            severity="secondary"
            text
            onClick={onCancel}
            disabled={loading}
          />
          <Button
            label="Confirmar entrega"
            icon="pi pi-check"
            severity="success"
            onClick={handleConfirm}
            loading={loading}
            disabled={loading || totals.totalLineas === 0}
          />
        </div>
      }
    >
      <div className="delivery-confirmation-summary">
        <div>
          <small>Cliente</small>
          <strong>{factura.nombrecliente}</strong>
        </div>
        <div>
          <small>Fecha factura</small>
          <strong>{factura.fechafactura}</strong>
        </div>
        <Tag value={`${totals.totalLineas} productos`} severity="info" rounded />
        <Tag value={`Cantidad total: ${formatNumber(totals.totalCantidad)}`} severity="warning" rounded />
      </div>

      <div className="delivery-confirmation-hint">
        <i className="pi pi-info-circle" />
        <span>
          Al confirmar, se guardará la entrega y se intentará abrir automáticamente la impresión.
        </span>
      </div>

      <DataTable
        value={factura.detalle}
        emptyMessage="No hay productos para entregar"
        scrollable
        scrollHeight="250px"
        size="small"
        className="delivery-confirmation-table"
      >
        <Column field="nombreproductos" header="Producto" />
        <Column field="referencia" header="Referencia" />
        <Column
          field="cantidad_entregar"
          header="Cant. a entregar"
          body={(rowData) => <span>{formatNumber(rowData.cantidad_entregar)}</span>}
        />
      </DataTable>

      <div className="delivery-confirmation-notes">
        <span className="p-float-label">
          <InputTextarea
            id="notasEntrega"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            autoResize
            className="delivery-confirmation-notes__input"
          />
          <label htmlFor="notasEntrega">Notas adicionales para la entrega</label>
        </span>
      </div>
    </Dialog>
  );
};

export default ConfirmationModal;
