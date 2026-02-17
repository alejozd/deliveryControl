import React, { useMemo } from "react";
import { Dropdown } from "primereact/dropdown";
import "../styles/modules/client-creation-sections.css";

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
  const fields = useMemo(
    () => [
      {
        id: "idcartera",
        label: "Cartera",
        value: selectedCartera,
        onChange: setSelectedCartera,
        options: carteraList,
        placeholder: "Seleccionar Cartera",
      },
      {
        id: "idnaturaleza",
        label: "Naturaleza",
        value: selectedNaturaleza,
        onChange: setSelectedNaturaleza,
        options: naturalezaList,
        placeholder: "Seleccionar Naturaleza",
      },
      {
        id: "idactividad",
        label: "Actividad",
        value: selectedActividad,
        onChange: setSelectedActividad,
        options: actividadList,
        placeholder: "Seleccionar Actividad",
        filter: true,
      },
      {
        id: "idciudad",
        label: "Ciudad",
        value: selectedCiudad,
        onChange: setSelectedCiudad,
        options: ciudadList,
        placeholder: "Seleccionar Ciudad",
        filter: true,
      },
    ],
    [
      actividadList,
      carteraList,
      ciudadList,
      naturalezaList,
      selectedActividad,
      selectedCartera,
      selectedCiudad,
      selectedNaturaleza,
      setSelectedActividad,
      setSelectedCartera,
      setSelectedCiudad,
      setSelectedNaturaleza,
    ]
  );

  return (
    <div className="client-creation-section">
      <small className="client-creation-section__hint">
        Completa la información administrativa adicional del cliente.
      </small>

      <div className="client-creation-section__grid">
        {fields.map((field) => (
          <div className="labelinput" key={field.id}>
            <label htmlFor={field.id}>{field.label}</label>
            <Dropdown
              className="inputtext"
              id={field.id}
              value={field.value}
              onChange={(e) => field.onChange(e.value)}
              options={field.options}
              optionLabel="label"
              placeholder={field.placeholder}
              aria-label={field.label}
              filter={field.filter}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(ClientCreationAddiData);
