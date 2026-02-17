import React, { useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";

const ClientCreationComercialData = ({
  regimenList,
  selectedRegimen,
  setSelectedRegimen,
  formaPagoList,
  selectedFormaPago,
  setSelectedFormaPago,
  listapreciosList,
  selectedlistaprecios,
  setSelectedlistaprecios,
  selectedareaIca,
  setSelectedareaIca,
  selectedaplicaReteFte,
  setSelectedAplicaReteFte,
  selectedaplicaBaseretefte,
  setSelectedAplicaBaseretefte,
  selectedaplicaBasereteIVA,
  setSelectedAplicaBasereteIVA,
  selectedaplicaBasereteICA,
  setSelectedAplicaBasereteICA,
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

  const handleCheckboxChange = (setter) => (e) => {
    setter(e.checked);
  };

  return (
    <div className="flex flex-column">
      {error && <div className="error-message">{error}</div>}
      <div className="labelinput">
        <label htmlFor="idregimen">Régimen</label>
        <Dropdown
          className="inputtext"
          id="idregimen"
          value={selectedRegimen}
          onChange={handleDropdownChange(setSelectedRegimen)}
          options={regimenList}
          optionLabel="label"
          placeholder="Seleccionar Régimen"
          aria-label="Seleccionar Régimen"
        />
      </div>
      <div className="labelinput">
        <label htmlFor="idformadepago">Forma de pago</label>
        <Dropdown
          className="inputtext"
          id="idformadepago"
          value={selectedFormaPago}
          onChange={handleDropdownChange(setSelectedFormaPago)}
          options={formaPagoList}
          optionLabel="label"
          placeholder="Seleccionar Forma de pago"
          aria-label="Seleccionar Forma de pago"
        />
      </div>
      <div className="labelinput">
        <label htmlFor="idlistaprecios">Lista de Precios</label>
        <Dropdown
          className="inputtext"
          id="idlistaprecios"
          value={selectedlistaprecios}
          onChange={handleDropdownChange(setSelectedlistaprecios)}
          options={listapreciosList}
          optionLabel="label"
          placeholder="Seleccionar Lista de Precios"
          aria-label="Seleccionar Lista de Precios"
        />
      </div>
      <div className="checkbox-container">
        <div className="flex align-items-center">
          <Checkbox
            inputId="idareaica"
            onChange={handleCheckboxChange(setSelectedareaIca)}
            checked={selectedareaIca}
            aria-label="Área ICA"
          />
          <label htmlFor="idareaica" className="ml-2">
            Área ICA
          </label>
        </div>
        <div className="flex align-items-center">
          <Checkbox
            inputId="idaplicaretefte"
            onChange={handleCheckboxChange(setSelectedAplicaReteFte)}
            checked={selectedaplicaReteFte}
            aria-label="Aplica retención en la fuente"
          />
          <label htmlFor="idaplicaretefte" className="ml-2">
            Aplica retención en la fuente
          </label>
        </div>
        <div className="flex align-items-center">
          <Checkbox
            inputId="idaplicabaseretefte"
            onChange={handleCheckboxChange(setSelectedAplicaBaseretefte)}
            checked={selectedaplicaBaseretefte}
            aria-label="Aplica base de retención en la fuente"
          />
          <label htmlFor="idaplicabaseretefte" className="ml-2">
            Aplica base de retención en la fuente
          </label>
        </div>
        <div className="flex align-items-center">
          <Checkbox
            inputId="idaplicabasereteIVA"
            onChange={handleCheckboxChange(setSelectedAplicaBasereteIVA)}
            checked={selectedaplicaBasereteIVA}
            aria-label="Aplica base en retención de IVA"
          />
          <label htmlFor="idaplicabasereteIVA" className="ml-2">
            Aplica base en retención de IVA
          </label>
        </div>
        <div className="flex align-items-center">
          <Checkbox
            inputId="idaplicabasereteICA"
            onChange={handleCheckboxChange(setSelectedAplicaBasereteICA)}
            checked={selectedaplicaBasereteICA}
            aria-label="Aplica base en retención de ICA"
          />
          <label htmlFor="idaplicabasereteICA" className="ml-2">
            Aplica base en retención de ICA
          </label>
        </div>
      </div>
    </div>
  );
};

export default ClientCreationComercialData;
