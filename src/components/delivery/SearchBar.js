// SearchBar.js
import React, { useState, useEffect } from "react";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import setupLocale from "../../config/localeConfig"; // Importar el locale
import "../../App.css";

function SearchBar(props) {
  const [errorMessage, setErrorMessage] = useState(""); // Estado para el mensaje de error

  useEffect(() => {
    setupLocale("es");
  }, []);

  const handleSearch = () => {
    const today = new Date();
    const selectedDate = new Date(props.selectedDate);

    if (isNaN(selectedDate)) {
      setErrorMessage("Por favor, seleccione una fecha válida.");
      return;
    }

    const diffDays = Math.ceil((today - selectedDate) / (1000 * 60 * 60 * 24)); // Diferencia en días

    if (diffDays > 15 && !props.searchTerm.trim()) {
      setErrorMessage("Por favor, ingrese un criterio de búsqueda.");
      return;
    }

    setErrorMessage("");
    props.handleSearch();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div>
      <Toolbar
        start={
          <div style={{ paddingTop: "3px" }}>
            <span className="p-float-label">
              <Calendar
                inputId="fechaFacturas"
                value={props.selectedDate}
                onChange={(e) => props.setSelectedDate(e.value)}
                showIcon
                dateFormat="dd/mm/yy"
                // locale="es"
              />
              <label htmlFor="fechaFacturas">Fecha facturas</label>
            </span>
          </div>
        }
        end={
          <div className="flex" style={{ paddingTop: "3px" }}>
            <span className="p-float-label">
              <InputText
                style={{ width: "320px" }}
                id="searchCriteria"
                // placeholder="Num. factura, cédula o nombre cliente"
                value={props.searchTerm}
                onChange={(e) => props.setSearchTerm(e.target.value)}
                onKeyPress={handleKeyDown}
                className="mobile-input"
              />
              <label htmlFor="searchCriteria">
                Num. factura, cédula o nombre cliente
              </label>
            </span>
            <Button
              label="Buscar"
              icon="pi pi-search"
              className="mr-2"
              onClick={handleSearch}
              raised
              loading={props.loading}
              style={{ marginLeft: "3px" }}
            />
          </div>
        }
      />
      {errorMessage && (
        <div style={{ color: "red", marginTop: "1em" }}>{errorMessage}</div>
      )}
    </div>
  );
}

export default SearchBar;
