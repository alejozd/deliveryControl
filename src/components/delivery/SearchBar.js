import React, { useEffect, useMemo, useState } from "react";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import setupLocale from "../../config/localeConfig";
import "./delivery.css";

function SearchBar({
  selectedDate,
  setSelectedDate,
  searchTerm,
  setSearchTerm,
  handleSearch,
  loading,
}) {
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setupLocale("es");
  }, []);

  const dayDifference = useMemo(() => {
    const today = new Date();
    const selected = new Date(selectedDate);

    if (Number.isNaN(selected.getTime())) {
      return Number.POSITIVE_INFINITY;
    }

    return Math.ceil((today - selected) / (1000 * 60 * 60 * 24));
  }, [selectedDate]);

  const validate = () => {
    const selected = new Date(selectedDate);

    if (Number.isNaN(selected.getTime())) {
      setErrorMessage("Selecciona una fecha válida.");
      return false;
    }

    if (dayDifference > 15 && !searchTerm.trim()) {
      setErrorMessage(
        "Para consultar más de 15 días atrás debes ingresar un criterio de búsqueda."
      );
      return false;
    }

    setErrorMessage("");
    return true;
  };

  const onSearch = () => {
    if (!validate()) return;
    handleSearch();
  };

  return (
    <div>
      <Toolbar
        className="delivery-searchbar"
        start={
          <span className="p-float-label">
            <Calendar
              inputId="fechaFacturas"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.value)}
              showIcon
              dateFormat="dd/mm/yy"
            />
            <label htmlFor="fechaFacturas">Fecha facturas</label>
          </span>
        }
        end={
          <div className="delivery-searchbar__actions">
            <span className="p-float-label">
              <InputText
                id="searchCriteria"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                className="delivery-searchbar__input"
              />
              <label htmlFor="searchCriteria">
                Núm. factura, cédula o nombre del cliente
              </label>
            </span>
            <Button
              label="Buscar"
              icon="pi pi-search"
              onClick={onSearch}
              loading={loading}
              raised
            />
          </div>
        }
      />
      {errorMessage && <small className="delivery-inline-error">{errorMessage}</small>}
    </div>
  );
}

export default SearchBar;
