import React, { useState } from "react";
import { Dropdown } from "primereact/dropdown";

const ClientCreationAddiData = ({
  carteraList,
  selectedCartera,
  setSelectedCartera,
  naturalezaList,
  selectedNaturaleza,
  setSelectedNaturaleza,
  actividadList,
  selectedActividad,
  setSelectedActividad,
  ciudadList,
  selectedCiudad,
  setSelectedCiudad,
}) => {
  const [error, setError] = useState(null);

  const handleDropdownChange = (setter) => (e) => {
    if (e.value) {
      setter(e.value);
      setError(null); // Clear error on valid selection
    } else {
      setError("Debe seleccionar una opción válida.");
    }
  };

  return (
    <div>
      <div className="labelinput">
        <label htmlFor="idcartera">Cartera</label>
        <Dropdown
          className="inputtext"
          id="idcartera"
          value={selectedCartera}
          onChange={handleDropdownChange(setSelectedCartera)}
          options={carteraList}
          optionLabel="label"
          placeholder="Seleccionar Cartera"
          aria-label="Seleccionar Cartera"
        />
      </div>
      <div className="labelinput">
        <label htmlFor="idnaturaleza">Naturaleza</label>
        <Dropdown
          className="inputtext"
          id="idnaturaleza"
          value={selectedNaturaleza}
          onChange={handleDropdownChange(setSelectedNaturaleza)}
          options={naturalezaList}
          optionLabel="label"
          placeholder="Seleccionar Naturaleza"
          aria-label="Seleccionar Naturaleza"
        />
      </div>
      <div className="labelinput">
        <label htmlFor="idactividad">Actividad</label>
        <Dropdown
          className="inputtext"
          id="idactividad"
          value={selectedActividad}
          onChange={handleDropdownChange(setSelectedActividad)}
          options={actividadList}
          optionLabel="label"
          placeholder="Seleccionar Actividad"
          panelClassName="custom-dropdown-panel"
          filter
          showClear
          aria-label="Seleccionar Actividad"
        />
      </div>
      <div className="labelinput">
        <label htmlFor="idciudad">Ciudad</label>
        <Dropdown
          className="inputtext"
          id="idciudad"
          value={selectedCiudad}
          onChange={handleDropdownChange(setSelectedCiudad)}
          options={ciudadList}
          optionLabel="label"
          placeholder="Seleccionar Ciudad"
          filter
          showClear
          aria-label="Seleccionar Ciudad"
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
};

export default ClientCreationAddiData;
