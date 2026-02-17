import React, { useCallback, useMemo, useRef, useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { Panel } from "primereact/panel";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import config from "../../Config";
import SearchBar from "./SearchBar";
import EntregasList from "./EntregasList";
import { formatDateForApi, getFriendlyErrorMessage } from "./deliveryUtils";

function Entregas() {
  const apiUrl = useMemo(
    () => `${config.apiUrl}/Datasnap/rest/TServerMethods1/entregas`,
    []
  );

  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [products, setProducts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const closeErrorDialog = useCallback(() => {
    setErrorMessage("");
  }, []);

  const handleUpdateAceptapotradatos = useCallback((idcliente, accepted) => {
    setProducts((current) =>
      current.map((product) =>
        product.idcliente === idcliente
          ? { ...product, aceptapotradatos: accepted ? 1 : 0 }
          : product
      )
    );
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);

    try {
      const response = await axios.post(
        apiUrl,
        {
          fechaFactura: formatDateForApi(selectedDate),
          criterio: searchTerm.trim(),
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const mapped = (response?.data?.result || []).map((entrega) => ({
        ...entrega,
        detalle: (entrega.detalle || []).map((detalle) => ({
          ...detalle,
          id: uuidv4(),
        })),
      }));

      setProducts(mapped);
    } catch (error) {
      const friendly = getFriendlyErrorMessage(error);
      setErrorMessage(friendly);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: friendly,
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  }, [apiUrl, searchTerm, selectedDate]);

  return (
    <div className="delivery-page">
      <Panel header="Control de Entregas" toggleable>
        <div className="card">
          <SearchBar
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleSearch={handleSearch}
            loading={loading}
          />
        </div>
      </Panel>

      <Toast ref={toast} />

      <EntregasList
        products={products}
        setProducts={setProducts}
        toast={toast}
        handleSearch={handleSearch}
        onUpdateAceptapotradatos={handleUpdateAceptapotradatos}
        loading={loading}
      />

      <Dialog
        visible={Boolean(errorMessage)}
        onHide={closeErrorDialog}
        header="Error"
        modal
        style={{ width: "25rem" }}
      >
        <p>{errorMessage}</p>
        <Button
          label="Cerrar"
          icon="pi pi-times"
          severity="danger"
          text
          onClick={closeErrorDialog}
        />
      </Dialog>
    </div>
  );
}

export default Entregas;
