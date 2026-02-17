import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import { PrintDocument } from "./PrintDocument";
import config from "../../Config";
import axios from "axios";
import { getFriendlyErrorMessage, toNumber } from "./deliveryUtils";
import "../../styles/modules/delivery.css";

const DetalleEntrega = ({ idEntrega, onClose, entregaData }) => {
  const apiUrl = `${config.apiUrl}/Datasnap/rest/TServerMethods1/DetalleEntrega`;

  const [detalleEntrega, setDetalleEntrega] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDetalleEntrega = useCallback(async () => {
    if (!idEntrega) {
      setDetalleEntrega([]);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await axios.put(apiUrl, { idEntrega });
      if (response.data?.status === 200) {
        setDetalleEntrega(Array.isArray(response.data.data) ? response.data.data : []);
        return;
      }

      setDetalleEntrega([]);
      setErrorMessage(
        response.data?.error || "No fue posible consultar el detalle de la entrega."
      );
    } catch (error) {
      setDetalleEntrega([]);
      setErrorMessage(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [apiUrl, idEntrega]);

  useEffect(() => {
    fetchDetalleEntrega();
  }, [fetchDetalleEntrega]);

  const buildFormattedDetalle = (detalle = []) =>
    detalle.map((item) => ({
      codigo: item.codigo,
      subcodigo: item.subcodigo,
      nombreproductos: item.nombreproductos,
      cantfacturada: item.cantfacturada,
      cant_entregada: item.cantentregada,
      saldo: item.saldo,
      id: item.id,
      cantidad_entregar: toNumber(item.cantentregada),
    }));

  const handlePrint = () => {
    const factura = {
      numfactura: entregaData?.numfactura,
      fechafactura: entregaData?.fechafactura,
      idcliente: entregaData?.idcliente,
      nombrecliente: entregaData?.nombrecliente,
      nit: entregaData?.nit,
      direccion: entregaData?.direccion,
      telmovil: entregaData?.telmovil,
      vendedor: entregaData?.vendedor,
      numeroentrega: entregaData?.numentrega,
      fechaEntrega: entregaData?.fechaentrega,
      notas: entregaData?.notas,
      detalle: buildFormattedDetalle(detalleEntrega),
    };

    PrintDocument({ factura, isConfirmationModal: false });
  };

  const totalEntregado = useMemo(
    () => detalleEntrega.reduce((acc, row) => acc + toNumber(row.cantentregada), 0),
    [detalleEntrega]
  );

  const totalPendiente = useMemo(
    () => detalleEntrega.reduce((acc, row) => acc + toNumber(row.saldo), 0),
    [detalleEntrega]
  );

  const numberTemplate = (value) => <span>{toNumber(value).toFixed(2)}</span>;

  return (
    <div className="delivery-detail">
      <div className="delivery-detail__header">
        <h3 className="delivery-detail__title">Productos entregados</h3>
        <div className="delivery-detail__summary">
          <span>
            Total entregado: <strong>{totalEntregado.toFixed(2)}</strong>
          </span>
          <span>
            Pendiente: <strong>{totalPendiente.toFixed(2)}</strong>
          </span>
        </div>
      </div>

      {errorMessage ? (
        <Message severity="error" text={errorMessage} className="delivery-detail__error" />
      ) : null}

      {loading ? (
        <div className="delivery-detail__loading">
          <ProgressSpinner style={{ width: "40px", height: "40px" }} strokeWidth="6" />
        </div>
      ) : (
        <DataTable
          value={detalleEntrega}
          showGridlines
          stripedRows
          responsiveLayout="scroll"
          emptyMessage="No se encontraron productos para esta entrega"
          className="p-datatable-sm delivery-detail__table"
        >
          <Column field="nombreproductos" header="Nombre Producto" />
          <Column field="referencia" header="Referencia" />
          <Column
            field="cantentregada"
            header="Cant. Entregada"
            body={(rowData) => numberTemplate(rowData.cantentregada)}
          />
          <Column
            field="saldo"
            header="Cant. Pendiente"
            body={(rowData) => numberTemplate(rowData.saldo)}
          />
        </DataTable>
      )}

      <div className="delivery-detail__actions">
        <Button
          label="Imprimir"
          icon="pi pi-print"
          onClick={handlePrint}
          className="p-button-secondary p-button-text"
          disabled={loading || !detalleEntrega.length}
        />
        <Button
          label="Cerrar"
          icon="pi pi-times"
          onClick={onClose}
          className="p-button-secondary p-button-text"
        />
      </div>
    </div>
  );
};

export default DetalleEntrega;
