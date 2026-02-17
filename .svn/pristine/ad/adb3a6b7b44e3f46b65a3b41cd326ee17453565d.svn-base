import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Toast } from "primereact/toast";
import "./SearchDialogListBox.css";

const ProductSearchDialog = ({
  showDialogProduct,
  setShowDialogProduct,
  products,
  onAcceptSelection,
  selectedBodega,
  initialSelectedProducts = [],
}) => {
  const [expandedRows, setExpandedRows] = useState(null);
  const [localProducts, setLocalProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const showRowExpansion = selectedBodega === "-1"; // Múltiples bodegas
  const toast = useRef(null);

  useEffect(() => {
    if (showDialogProduct && products.length > 0) {
      setLoading(true);
      const initializedProducts = products.map((product) => {
        const filteredBodegas =
          selectedBodega > 0
            ? product.bodegas.filter(
                (b) => Number(b.codigobodega) === Number(selectedBodega)
              )
            : product.bodegas;

        const bodegasConCantidades = filteredBodegas.map((bodega) => {
          const bodegaExistente = initialSelectedProducts.find(
            (p) =>
              p.codigo === product.codigo &&
              p.subcodigo === product.subcodigo &&
              Number(p.codigobodega) === Number(bodega.codigobodega)
          );

          return {
            ...bodega,
            cantidad: bodegaExistente?.cantidad || 0,
            nombrebodega: bodega.s_nombre || bodega.nombrebodega,
            existencia: bodega.s_existencia || bodega.existencia,
          };
        });

        const cantidadTotal = bodegasConCantidades.reduce(
          (sum, b) => sum + (b.cantidad || 0),
          0
        );

        return {
          ...product,
          cantidad: cantidadTotal,
          bodegas: bodegasConCantidades,
          existencia_total:
            selectedBodega > 0
              ? bodegasConCantidades[0]?.existencia || 0
              : bodegasConCantidades.reduce(
                  (sum, b) => sum + (b.existencia || 0),
                  0
                ),
          uniqueKey: `${product.codigo}-${product.subcodigo}`,
        };
      });

      setLocalProducts(initializedProducts);
      setExpandedRows(null);

      // También actualizamos los productos seleccionados para marcarlos
      const agrupados = {};
      initialSelectedProducts.forEach((item) => {
        const key = `${item.codigo}-${item.subcodigo}`;
        if (!agrupados[key]) {
          agrupados[key] = {
            ...item,
            cantidad: 0,
            bodegas: [],
            uniqueKey: key,
          };
        }

        agrupados[key].cantidad += item.cantidad;
        agrupados[key].bodegas.push({
          codigobodega: item.codigobodega,
          nombrebodega: item.nombrebodega,
          cantidad: item.cantidad,
          existencia: item.existencia || 0,
        });
      });
      setSelectedProducts(Object.values(agrupados));

      setLoading(false);
    }
  }, [showDialogProduct]);

  const handleCantidadChange = (producto, nuevaCantidad) => {
    const cantidadFinal = Math.min(nuevaCantidad, producto.existencia_total);

    const updatedProducts = localProducts.map((p) => {
      if (p.uniqueKey === producto.uniqueKey) {
        return { ...p, cantidad: cantidadFinal };
      }
      return p;
    });

    setLocalProducts(updatedProducts);

    // Actualizar productos seleccionados
    const alreadySelected = selectedProducts.some(
      (sp) => sp.uniqueKey === producto.uniqueKey
    );
    let newSelected = [...selectedProducts];

    if (cantidadFinal > 0 && !alreadySelected) {
      newSelected.push({ ...producto, cantidad: cantidadFinal });
    } else if (cantidadFinal === 0 && alreadySelected) {
      newSelected = newSelected.filter(
        (sp) => sp.uniqueKey !== producto.uniqueKey
      );
    } else if (cantidadFinal > 0 && alreadySelected) {
      newSelected = newSelected.map((sp) =>
        sp.uniqueKey === producto.uniqueKey
          ? { ...sp, cantidad: cantidadFinal }
          : sp
      );
    }

    setSelectedProducts(newSelected);
  };

  const handleCantidadBodegaChange = (producto, bodegaId, nuevaCantidad) => {
    const updatedProducts = localProducts.map((p) => {
      if (p.uniqueKey === producto.uniqueKey) {
        const updatedBodegas = p.bodegas.map((b) => {
          if (b.codigobodega === bodegaId) {
            return { ...b, cantidad: Math.min(nuevaCantidad, b.existencia) };
          }
          return b;
        });

        const cantidadTotal = updatedBodegas.reduce(
          (sum, b) => sum + b.cantidad,
          0
        );

        // Actualiza productos seleccionados
        const alreadySelected = selectedProducts.some(
          (sp) => sp.uniqueKey === p.uniqueKey
        );
        let newSelected = [...selectedProducts];

        if (cantidadTotal > 0 && !alreadySelected) {
          newSelected.push({
            ...p,
            bodegas: updatedBodegas,
            cantidad: cantidadTotal,
          });
        } else if (cantidadTotal === 0 && alreadySelected) {
          newSelected = newSelected.filter(
            (sp) => sp.uniqueKey !== p.uniqueKey
          );
        } else if (cantidadTotal > 0 && alreadySelected) {
          newSelected = newSelected.map((sp) =>
            sp.uniqueKey === p.uniqueKey
              ? { ...sp, bodegas: updatedBodegas, cantidad: cantidadTotal }
              : sp
          );
        }

        setSelectedProducts(newSelected);

        return { ...p, bodegas: updatedBodegas, cantidad: cantidadTotal };
      }
      return p;
    });

    setLocalProducts(updatedProducts);
  };

  const rowExpansionTemplate = (product) => {
    return (
      <div className="p-3">
        <h5>Disponibilidad en Bodegas</h5>
        <DataTable
          value={product.bodegas}
          size="small"
          className="p-datatable-sm"
          lazy
        >
          <Column field="nombrebodega" header="Bodega" />
          <Column field="existencia" header="Existencia" />
          <Column
            header="Cantidad"
            body={(bodega) => (
              <InputNumber
                value={bodega.cantidad}
                onValueChange={(e) =>
                  handleCantidadBodegaChange(
                    product,
                    bodega.codigobodega,
                    e.value
                  )
                }
                min={0}
                max={bodega.existencia}
                showButtons
                mode="decimal"
                locale="en-US"
                decimalSeparator="."
                thousandSeparator=","
                inputStyle={{ width: "60px" }} // Ajusta solo el input interno
                buttonLayout="horizontal" // Opcional: pone los botones + y - a los lados
                decrementButtonClassName="p-button-secondary"
                incrementButtonClassName="p-button-secondary"
              />
            )}
          />
        </DataTable>
      </div>
    );
  };

  const onHide = () => {
    setShowDialogProduct(false);
  };

  const desglosarPorBodega = (productos) => {
    const productosDesglosados = [];
    productos.forEach((producto) => {
      producto.bodegas.forEach((bodega) => {
        if (bodega.cantidad > 0) {
          productosDesglosados.push({
            codigo: producto.codigo,
            subcodigo: producto.subcodigo,
            nombreproducto: producto.nombreproducto,
            codigo_barras: producto.codigo_barras,
            referencia: producto.referencia,
            precio_fijo: producto.precio_fijo,
            tarifa_iva: producto.tarifa_iva,
            existencia_total: producto.existencia_total,
            cantidad: bodega.cantidad,
            nombrebodega: bodega.nombrebodega,
            codigobodega: bodega.codigobodega,
            uniqueKey: `${producto.codigo}-${producto.subcodigo}-${bodega.codigobodega}`,
          });
        }
      });
    });

    return productosDesglosados;
  };

  const acceptSelection = () => {
    // Seleccionar los productos con cantidades mayores a 0
    const selectedProducts = localProducts.filter((product) => {
      if (selectedBodega === "-1") {
        // Si es múltiples bodegas, revisar cada bodega
        return product.bodegas.some((bodega) => bodega.cantidad > 0);
      } else {
        // Si es una sola bodega, revisar la cantidad del producto
        return product.cantidad > 0;
      }
    });

    // Desglosar los productos por bodega utilizando la función desglosarPorBodega
    let productosDesglosados = [];
    if (selectedBodega === "-1") {
      // Múltiples bodegas: desglosar desde el arreglo de bodegas
      productosDesglosados = desglosarPorBodega(selectedProducts);
    } else {
      // Una sola bodega: crear estructura compatible manualmente
      productosDesglosados = selectedProducts.map((producto) => ({
        codigo: producto.codigo,
        subcodigo: producto.subcodigo,
        nombreproducto: producto.nombreproducto,
        codigo_barras: producto.codigo_barras,
        referencia: producto.referencia,
        precio_fijo: producto.precio_fijo,
        tarifa_iva: producto.tarifa_iva,
        existencia_total: producto.existencia_total,
        cantidad: producto.cantidad,
        nombrebodega: producto.nombrebodega, // esto lo cargas al seleccionar la bodega
        codigobodega: selectedBodega,
        uniqueKey: `${producto.codigo}-${producto.subcodigo}-${selectedBodega}`,
      }));
    }

    // Si existen productos desglozados, pasar al evento onAcceptSelection
    if (productosDesglosados.length > 0) {
      onAcceptSelection(productosDesglosados);
      onHide(); // Cerrar el diálogo
    } else {
      alert("Por favor seleccione al menos un producto con cantidad mayor a 0");
    }
  };

  const handleSelectionChange = (e) => {
    const newSelection = e.value;

    // Detectar productos inválidos
    const invalidProducts = newSelection.filter((producto) => {
      return selectedBodega === "-1"
        ? !producto.bodegas?.some((b) => b.cantidad > 0)
        : !(producto.cantidad > 0);
    });

    if (invalidProducts.length > 0) {
      toast.current.show({
        severity: "warn",
        summary: "Cantidad requerida",
        detail: `Debe ingresar una cantidad válida para el producto ${invalidProducts[0].nombreproducto}`,
        life: 3000,
      });
    }

    // Solo seleccionar productos válidos
    const validSelection = newSelection.filter((producto) => {
      return selectedBodega === "-1"
        ? producto.bodegas?.some((b) => b.cantidad > 0)
        : producto.cantidad > 0;
    });

    setSelectedProducts(validSelection);
  };

  return (
    <Dialog
      header="Selección de Productos"
      visible={showDialogProduct}
      style={{ width: "90vw", maxWidth: "1200px" }}
      onHide={onHide}
      footer={
        <div>
          <Button
            label="Aceptar"
            icon="pi pi-check"
            onClick={acceptSelection}
            autoFocus
            className="p-button-success"
          />
          <Button
            label="Cancelar"
            icon="pi pi-times"
            onClick={onHide}
            className="p-button-secondary"
          />
        </div>
      }
    >
      <Toast ref={toast} />
      <DataTable
        value={localProducts}
        selection={selectedProducts}
        onSelectionChange={handleSelectionChange}
        onSelectAll={(e) => e.preventDefault()}
        // selectionMode="checkbox"
        dataKey="uniqueKey"
        rowExpansionTemplate={rowExpansionTemplate}
        expandedRows={expandedRows}
        onRowToggle={(e) => setExpandedRows(e.data)}
        loading={loading}
        scrollable
        paginator
        rows={10}
      >
        <Column
          selectionMode="multiple"
          exportable={false}
          header={() => null}
          headerStyle={{ width: "3em" }}
          bodyStyle={{ textAlign: "center" }}
        />
        <Column expander style={{ width: "3em" }} hidden={selectedBodega > 0} />

        <Column
          field="nombreproducto"
          header="Producto"
          style={{ minWidth: "200px" }}
        />
        <Column
          field="referencia"
          header="Referencia"
          style={{ width: "120px" }}
        />
        {selectedBodega > 0 && (
          <Column
            field="nombrebodega"
            header="Bodega"
            body={(products) => {
              // Filtrar la bodega seleccionada por el ID de la bodega
              const selectedBodegaData = products.bodegas.find(
                (bodega) =>
                  Number(bodega.codigobodega) === Number(selectedBodega)
              );
              return (
                <span>
                  {selectedBodegaData
                    ? selectedBodegaData.nombrebodega || "No disponible"
                    : "No disponible"}
                </span>
              );
            }}
            style={{ width: "150px" }}
          />
        )}

        <Column
          field="existencia_total"
          header={selectedBodega === "-1" ? "Existencia Total" : "Existencia"}
          style={{ width: "120px" }}
        />
        <Column
          field="cantidad"
          header="Cantidad Total"
          body={(rowData) => (
            <InputNumber
              value={rowData.cantidad}
              onValueChange={(e) => handleCantidadChange(rowData, e.value)}
              disabled={selectedBodega === "-1"}
              // disabled
              min={0}
              max={rowData.existencia_total}
              showButtons
              mode="decimal"
              locale="en-US"
              decimalSeparator="."
              thousandSeparator=","
              inputStyle={{ width: "60px" }}
              buttonLayout="horizontal"
              decrementButtonClassName="p-button-secondary"
              incrementButtonClassName="p-button-secondary"
            />
          )}
        />
      </DataTable>
    </Dialog>
  );
};

export default ProductSearchDialog;
