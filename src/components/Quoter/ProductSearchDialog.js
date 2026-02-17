import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import "../../styles/quoter/search-dialog-listbox.css";

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
  const [searchTerm, setSearchTerm] = useState("");
  const toast = useRef(null);

  const isMultiBodega = String(selectedBodega) === "-1";

  useEffect(() => {
    if (showDialogProduct && products.length > 0) {
      setLoading(true);

      const initializedProducts = products.map((product) => {
        const filteredBodegas =
          Number(selectedBodega) > 0
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
            Number(selectedBodega) > 0
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

      const grouped = {};
      initialSelectedProducts.forEach((item) => {
        const key = `${item.codigo}-${item.subcodigo}`;
        if (!grouped[key]) {
          grouped[key] = {
            ...item,
            cantidad: 0,
            bodegas: [],
            uniqueKey: key,
          };
        }

        grouped[key].cantidad += item.cantidad;
        grouped[key].bodegas.push({
          codigobodega: item.codigobodega,
          nombrebodega: item.nombrebodega,
          cantidad: item.cantidad,
          existencia: item.existencia || 0,
        });
      });

      setSelectedProducts(Object.values(grouped));
      setLoading(false);
    }
  }, [showDialogProduct, products, selectedBodega, initialSelectedProducts]);


  const showNoStockToast = useCallback((productName) => {
    toast.current?.show({
      severity: "warn",
      summary: "Sin existencia",
      detail: `El producto ${productName || "seleccionado"} no tiene existencia disponible.`,
      life: 2800,
    });
  }, []);

  const filteredProducts = useMemo(() => {
    const criteria = searchTerm.trim().toLowerCase();
    if (!criteria) return localProducts;

    return localProducts.filter((product) =>
      [product?.nombreproducto, product?.referencia, product?.codigo_barras]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(criteria))
    );
  }, [localProducts, searchTerm]);

  const updateSelectedProducts = useCallback((producto, cantidadTotal, updatedBodegas = null) => {
    const alreadySelected = selectedProducts.some(
      (sp) => sp.uniqueKey === producto.uniqueKey
    );

    let next = [...selectedProducts];

    if (cantidadTotal > 0 && !alreadySelected) {
      next.push({
        ...producto,
        cantidad: cantidadTotal,
        bodegas: updatedBodegas || producto.bodegas,
      });
    } else if (cantidadTotal === 0 && alreadySelected) {
      next = next.filter((sp) => sp.uniqueKey !== producto.uniqueKey);
    } else if (cantidadTotal > 0 && alreadySelected) {
      next = next.map((sp) =>
        sp.uniqueKey === producto.uniqueKey
          ? {
              ...sp,
              cantidad: cantidadTotal,
              bodegas: updatedBodegas || sp.bodegas,
            }
          : sp
      );
    }

    setSelectedProducts(next);
  }, [selectedProducts]);

  const handleCantidadChange = (producto, nuevaCantidad) => {
    if ((producto.existencia_total || 0) <= 0) {
      showNoStockToast(producto?.nombreproducto);
      return;
    }

    const cantidadFinal = Math.min(nuevaCantidad || 0, producto.existencia_total || 0);

    const updatedProducts = localProducts.map((p) =>
      p.uniqueKey === producto.uniqueKey ? { ...p, cantidad: cantidadFinal } : p
    );

    setLocalProducts(updatedProducts);
    updateSelectedProducts(producto, cantidadFinal);
  };

  const handleCantidadBodegaChange = (producto, bodegaId, nuevaCantidad) => {
    const targetBodega = producto.bodegas.find((b) => b.codigobodega === bodegaId);
    if ((targetBodega?.existencia || 0) <= 0) {
      showNoStockToast(producto?.nombreproducto);
      return;
    }

    const updatedProducts = localProducts.map((p) => {
      if (p.uniqueKey === producto.uniqueKey) {
        const updatedBodegas = p.bodegas.map((b) =>
          b.codigobodega === bodegaId
            ? { ...b, cantidad: Math.min(nuevaCantidad || 0, b.existencia || 0) }
            : b
        );

        const cantidadTotal = updatedBodegas.reduce(
          (sum, b) => sum + (b.cantidad || 0),
          0
        );

        updateSelectedProducts(p, cantidadTotal, updatedBodegas);
        return { ...p, bodegas: updatedBodegas, cantidad: cantidadTotal };
      }

      return p;
    });

    setLocalProducts(updatedProducts);
  };

  const rowExpansionTemplate = (product) => (
    <div className="product-dialog__expanded">
      <DataTable value={product.bodegas} size="small">
        <Column field="nombrebodega" header="Bodega" />
        <Column field="existencia" header="Existencia" />
        <Column
          field="cantidad"
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
              max={bodega.existencia || 0}
              onFocus={() => {
                if ((bodega.existencia || 0) <= 0) showNoStockToast(product?.nombreproducto);
              }}
              showButtons
              mode="decimal"
              locale="en-US"
              inputStyle={{ width: "64px" }}
              buttonLayout="horizontal"
              decrementButtonClassName="p-button-secondary"
              incrementButtonClassName="p-button-secondary"
            />
          )}
        />
      </DataTable>
    </div>
  );

  const onHide = () => {
    setShowDialogProduct(false);
    setSearchTerm("");
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
    const validProducts = localProducts.filter((product) =>
      isMultiBodega
        ? product.bodegas.some((bodega) => bodega.cantidad > 0)
        : product.cantidad > 0
    );

    const productosDesglosados = isMultiBodega
      ? desglosarPorBodega(validProducts)
      : validProducts.map((producto) => ({
          codigo: producto.codigo,
          subcodigo: producto.subcodigo,
          nombreproducto: producto.nombreproducto,
          codigo_barras: producto.codigo_barras,
          referencia: producto.referencia,
          precio_fijo: producto.precio_fijo,
          tarifa_iva: producto.tarifa_iva,
          existencia_total: producto.existencia_total,
          cantidad: producto.cantidad,
          nombrebodega: producto.nombrebodega,
          codigobodega: selectedBodega,
          uniqueKey: `${producto.codigo}-${producto.subcodigo}-${selectedBodega}`,
        }));

    if (productosDesglosados.length > 0) {
      onAcceptSelection(productosDesglosados);
      onHide();
      return;
    }

    toast.current?.show({
      severity: "warn",
      summary: "Sin selección",
      detail: "Selecciona al menos un producto con cantidad mayor a 0.",
      life: 3000,
    });
  };

  const handleSelectionChange = (e) => {
    const newSelection = e.value;

    const invalidProducts = newSelection.filter((producto) =>
      isMultiBodega
        ? !producto.bodegas?.some((b) => b.cantidad > 0)
        : !(producto.cantidad > 0)
    );

    if (invalidProducts.length > 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Cantidad requerida",
        detail: `Debe ingresar una cantidad válida para ${invalidProducts[0].nombreproducto}`,
        life: 3000,
      });
    }

    const validSelection = newSelection.filter((producto) =>
      isMultiBodega
        ? producto.bodegas?.some((b) => b.cantidad > 0)
        : producto.cantidad > 0
    );

    setSelectedProducts(validSelection);
  };

  const footer = (
    <div className="product-dialog__footer">
      <small>
        {selectedProducts.length} producto(s) seleccionado(s)
      </small>
      <div className="product-dialog__footer-actions">
        <Button label="Cancelar" icon="pi pi-times" onClick={onHide} text />
        <Button label="Agregar" icon="pi pi-check" onClick={acceptSelection} severity="success" />
      </div>
    </div>
  );

  return (
    <Dialog
      header="Seleccionar productos"
      visible={showDialogProduct}
      className="product-search-dialog"
      onHide={onHide}
      footer={footer}
      draggable={false}
      modal
    >
      <Toast ref={toast} />

      <div className="product-dialog__toolbar">
        <IconField iconPosition="left" className="product-dialog__search-field">
          <InputIcon className="pi pi-search" />
          <InputText
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, referencia o código"
          />
        </IconField>

        <span className="product-dialog__chip">
          {isMultiBodega ? "Modo: múltiples bodegas" : "Modo: bodega única"}
        </span>
      </div>

      <DataTable
        value={filteredProducts}
        selection={selectedProducts}
        onSelectionChange={handleSelectionChange}
        onSelectAll={(e) => e.preventDefault()}
        dataKey="uniqueKey"
        rowExpansionTemplate={rowExpansionTemplate}
        expandedRows={expandedRows}
        onRowToggle={(e) => setExpandedRows(e.data)}
        loading={loading}
        scrollable
        paginator
        rows={10}
        rowsPerPageOptions={[10, 20, 50]}
        responsiveLayout="scroll"
        className="product-dialog__table"
        emptyMessage="No hay productos disponibles para mostrar"
      >
        <Column
          selectionMode="multiple"
          exportable={false}
          header={() => null}
          headerStyle={{ width: "3em" }}
          bodyStyle={{ textAlign: "center" }}
        />
        <Column expander style={{ width: "3em" }} hidden={Number(selectedBodega) > 0} />

        <Column field="nombreproducto" header="Producto" style={{ minWidth: "220px" }} />
        <Column field="referencia" header="Referencia" style={{ width: "140px" }} />

        {Number(selectedBodega) > 0 && (
          <Column
            field="nombrebodega"
            header="Bodega"
            body={(product) => {
              const selectedBodegaData = product.bodegas.find(
                (bodega) => Number(bodega.codigobodega) === Number(selectedBodega)
              );
              return selectedBodegaData?.nombrebodega || "No disponible";
            }}
            style={{ width: "180px" }}
          />
        )}

        <Column
          field="existencia_total"
          header={isMultiBodega ? "Existencia total" : "Existencia"}
          style={{ width: "120px" }}
        />
        <Column
          field="cantidad"
          header="Cantidad"
          body={(rowData) => (
            <InputNumber
              value={rowData.cantidad}
              onValueChange={(e) => handleCantidadChange(rowData, e.value)}
              disabled={isMultiBodega}
              min={0}
              max={rowData.existencia_total || 0}
              onFocus={() => {
                if ((rowData.existencia_total || 0) <= 0) showNoStockToast(rowData?.nombreproducto);
              }}
              showButtons
              mode="decimal"
              locale="en-US"
              inputStyle={{ width: "64px" }}
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
