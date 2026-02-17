// Productos.js
import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";
import { Panel } from "primereact/panel";
import axios from "axios";
import config from "../Config";

const apiUrl = `${config.apiUrl}/Datasnap/rest/TServerMethods1/ListaProductos`;

function Productos() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    axios
      .get(apiUrl)
      .then((response) => {
        setProducts(response.data.result);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const toolbar = (
    <Toolbar
      start={
        <Button
          label="Traer productos"
          icon="pi pi-refresh"
          onClick={fetchProducts}
        />
      }
    />
  );

  const formatCurrency = (amount) => {
    return `$ ${amount.toLocaleString("es-CO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="productos-container">
      <h1>Listado de Productos</h1>
      {toolbar}
      <div className="card">
        <DataTable
          value={products}
          responsive={true}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          loading={loading}
          emptyMessage="No hay registros"
        >
          <Column field="nombre" header="Nombre" sortable></Column>
          <Column field="referencia" header="Referencia" sortable></Column>
          <Column
            field="precio"
            header="Precio"
            body={(rowData) => formatCurrency(rowData.precio)}
            sortable
          ></Column>
        </DataTable>
      </div>
    </div>
  );
}

export default Productos;
