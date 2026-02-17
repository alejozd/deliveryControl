import React, { useState } from "react";
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
}) => {
  const [notas, setNotas] = useState("");

  const handleConfirm = async () => {
    const resolvedNumeroEntrega = await onConfirm(numEntrega, notas);
    onCancel(resolvedNumeroEntrega);
  };

  return (
    <Dialog
      header={`Confirmar Entrega ${numEntrega} para la Factura ${factura.numfactura}`}
      visible={visible}
      style={{ width: "50vw" }}
      breakpoints={{ "960px": "75vw", "641px": "100vw" }}
      onHide={onCancel}
      position="top"
      footer={
        <div>
          <Button
            label="Cancelar"
            icon="pi pi-times"
            severity="danger"
            text
            raised
            onClick={onCancel}
          />
          <Button
            label="Confirmar"
            icon="pi pi-check"
            severity="success"
            raised
            onClick={handleConfirm}
          />
        </div>
      }
    >
      <div>
        <h4>Cliente: {factura.nombrecliente}</h4>
        <h4>Fecha de Factura: {factura.fechafactura}</h4>
        <h4>Productos:</h4>
        <DataTable
          value={factura.detalle}
          emptyMessage="No se han encontrado resultados"
          scrollable
          scrollHeight="200px"
        >
          <Column field="nombreproductos" header="Nombre del Producto" />
          <Column
            field="cantidad_entregar"
            header="Cantidad a Entregar"
            body={(rowData) => (
              <span>{rowData.cantidad_entregar.toFixed(2)}</span>
            )}
          />
        </DataTable>
        <div className="card" style={{ paddingTop: "20px", marginTop: "5px" }}>
          <span className="p-float-label">
            <InputTextarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              autoResize
              style={{ width: "100%", height: "100px" }}
            />
            <label htmlFor="Notas">Notas</label>
          </span>
        </div>
      </div>
    </Dialog>
  );
};

export default ConfirmationModal;
