import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputTextarea } from "primereact/inputtextarea";

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

  const handleConfirm = async () => {
    await onConfirm(numEntrega, notas.trim());
  };

  return (
    <Dialog
      header={`Confirmar entrega #${numEntrega} · Factura ${factura.numfactura}`}
      visible={visible}
      style={{ width: "52rem", maxWidth: "95vw" }}
      breakpoints={{ "960px": "90vw", "641px": "100vw" }}
      onHide={onCancel}
      position="top"
      footer={
        <div>
          <Button
            label="Cancelar"
            icon="pi pi-times"
            severity="secondary"
            text
            onClick={onCancel}
            disabled={loading}
          />
          <Button
            label="Confirmar"
            icon="pi pi-check"
            severity="success"
            onClick={handleConfirm}
            loading={loading}
          />
        </div>
      }
    >
      <h4>Cliente: {factura.nombrecliente}</h4>
      <h4>Fecha de factura: {factura.fechafactura}</h4>
      <DataTable value={factura.detalle} emptyMessage="No hay productos para entregar" scrollable scrollHeight="220px">
        <Column field="nombreproductos" header="Producto" />
        <Column
          field="cantidad_entregar"
          header="Cant. a entregar"
          body={(rowData) => <span>{Number(rowData.cantidad_entregar).toFixed(2)}</span>}
        />
      </DataTable>

      <div className="card" style={{ paddingTop: "20px" }}>
        <span className="p-float-label">
          <InputTextarea
            id="notasEntrega"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            autoResize
            style={{ width: "100%", minHeight: "100px" }}
          />
          <label htmlFor="notasEntrega">Notas adicionales</label>
        </span>
      </div>
    </Dialog>
  );
};

export default ConfirmationModal;
