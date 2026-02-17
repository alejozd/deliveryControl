import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { PrintDocument } from "./PrintDocument";
import config from "../../Config";
import axios from "axios";

const DetalleEntrega = ({ idEntrega, onClose, entregaData }) => {
  const apiUrl = `${config.apiUrl}/Datasnap/rest/TServerMethods1/DetalleEntrega`;
  const [detalleEntrega, setDetalleEntrega] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.put(apiUrl, { idEntrega });
        if (response.data.status === 200) {
          setDetalleEntrega(response.data.data);
        } else {
          console.error("Error en la respuesta:", response.data.error);
        }
      } catch (error) {
        console.error("Error al realizar la solicitud:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idEntrega, apiUrl]);

  const buildFormattedFactura = (entregaData, detalleEntrega) => ({
    numfactura: entregaData.numfactura,
    fechafactura: entregaData.fechafactura,
    idcliente: entregaData.idcliente,
    nombrecliente: entregaData.nombrecliente,
    nit: entregaData.nit,
    direccion: entregaData.direccion,
    telmovil: entregaData.telmovil,
    vendedor: entregaData.vendedor,
    numeroentrega: entregaData.numentrega,
    fechaEntrega: entregaData.fechaentrega,
    notas: entregaData.notas,
    detalle: buildFormattedDetalle(detalleEntrega),
  });

  const buildFormattedDetalle = (detalleEntrega) =>
    detalleEntrega.map((detalle) => ({
      codigo: detalle.codigo,
      subcodigo: detalle.subcodigo,
      nombreproductos: detalle.nombreproductos,
      cantfacturada: detalle.cantfacturada,
      cant_entregada: detalle.cantentregada,
      saldo: detalle.saldo,
      id: detalle.id,
      cantidad_entregar: parseFloat(detalle.cantentregada) || 0,
    }));

  const handlePrint = () => {
    const entregaFull = buildFormattedFactura(entregaData, detalleEntrega);
    PrintDocument({ factura: entregaFull, isConfirmationModal: false });
  };

  return (
    <div>
      <h2>Productos</h2>
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <DataTable
          value={detalleEntrega}
          showGridlines
          stripedRows
          emptyMessage="No se han encontrado resultados"
          className="p-datatable-sm"
        >
          <Column field="nombreproductos" header="Nombre Producto" />
          <Column field="referencia" header="Referencia" />
          <Column
            field="cantentregada"
            header="Cant. Entregada"
            body={(rowData) => (
              <span>{parseFloat(rowData.cantentregada).toFixed(2)}</span>
            )}
          />
          <Column
            field="saldo"
            header="Cant. Pendiente"
            body={(rowData) => (
              <span>{parseFloat(rowData.saldo).toFixed(2)}</span>
            )}
          />
        </DataTable>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "20px",
        }}
      >
        <Button
          label="Imprimir"
          icon="pi pi-print"
          onClick={handlePrint}
          className="p-button-secondary p-button-text p-mt-2"
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
