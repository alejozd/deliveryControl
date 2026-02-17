import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { PickList } from "primereact/picklist";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Panel } from "primereact/panel";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Toast } from "primereact/toast";
import axios from "axios";
import config from "../Config";
import "../styles/modules/client-contact-association.css";

const ClientContactAssociation = () => {
  const apiUrl = `${config.apiUrl}/Datasnap/rest/TServerMethods1/ListaClientes`;
  const apiUrlContactosCliente = `${config.apiUrl}/Datasnap/rest/TServerMethods1/DataContactosCliente`;
  const apiUrlListaContactos = `${config.apiUrl}/Datasnap/rest/TServerMethods1/ListaContactos`;
  const apiUrlGuardarAsociaciones = `${config.apiUrl}/Datasnap/rest/TServerMethods1/AsociarContacto`;

  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedClienteLabel, setSelectedClienteLabel] = useState("");
  const [sourceContactos, setSourceContactos] = useState([]);
  const [targetContactos, setTargetContactos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingContactos, setLoadingContactos] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useRef(null);

  const getFriendlyErrorMessage = useCallback((error, fallbackMessage) => {
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.response?.data?.error) return error.response.data.error;
    if (typeof error?.response?.data === "string") return error.response.data;
    if (error?.message) return error.message;
    return fallbackMessage;
  }, []);

  const showToast = useCallback((severity, summary, detail) => {
    toast.current?.show({ severity, summary, detail, life: 3200 });
  }, []);

  const fetchClientes = useCallback(
    async (term) => {
      setLoadingClientes(true);
      try {
        const response = await axios.put(apiUrl, { criterio: term });
        const formattedClientes = (response?.data?.data || []).map((cliente) => ({
          label: `${cliente.nombrecliente} (${cliente.identidad})`,
          value: cliente.idcliente,
        }));
        setClientes(formattedClientes);
      } catch (error) {
        showToast(
          "error",
          "Error",
          getFriendlyErrorMessage(error, "No se pudieron cargar los clientes.")
        );
      } finally {
        setLoadingClientes(false);
      }
    },
    [apiUrl, getFriendlyErrorMessage, showToast]
  );

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchTerm.trim().length > 1) {
        fetchClientes(searchTerm.trim());
      } else {
        setClientes([]);
      }
    }, 350);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, fetchClientes]);

  const resetContactLists = useCallback(() => {
    setSourceContactos([]);
    setTargetContactos([]);
  }, []);

  const onClienteChange = useCallback(
    async (e) => {
      const clienteId = e.value;
      setSelectedCliente(clienteId);

      const selectedOption = clientes.find((item) => item.value === clienteId);
      setSelectedClienteLabel(selectedOption?.label || "");

      if (!clienteId) {
        resetContactLists();
        return;
      }

      setLoadingContactos(true);
      try {
        const [responseContactos, responseContactosAsociados] = await Promise.all([
          axios.put(apiUrlListaContactos, { criterio: "" }),
          axios.put(apiUrlContactosCliente, { idcliente: clienteId }),
        ]);

        const contactosDisponibles = Array.isArray(responseContactos?.data?.data)
          ? responseContactos.data.data
          : [];

        const asociados = Array.isArray(responseContactosAsociados?.data?.contactos)
          ? responseContactosAsociados.data.contactos
          : [];

        const asociadosIds = new Set(asociados.map((contacto) => contacto.idcontacto));
        const disponiblesFiltrados = contactosDisponibles.filter(
          (contacto) => !asociadosIds.has(contacto.idcontacto)
        );

        setSourceContactos(disponiblesFiltrados);
        setTargetContactos(asociados);
      } catch (error) {
        resetContactLists();
        showToast(
          "error",
          "Error",
          getFriendlyErrorMessage(error, "No se pudieron cargar los contactos del cliente.")
        );
      } finally {
        setLoadingContactos(false);
      }
    },
    [
      apiUrlContactosCliente,
      apiUrlListaContactos,
      clientes,
      getFriendlyErrorMessage,
      resetContactLists,
      showToast,
    ]
  );

  const handleSave = useCallback(async () => {
    if (!selectedCliente) {
      showToast("warn", "Cliente requerido", "Selecciona un cliente antes de guardar.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        idcliente: selectedCliente,
        contactos: targetContactos.map((contacto) => ({ idcontacto: contacto.idcontacto })),
      };

      const response = await axios.put(apiUrlGuardarAsociaciones, payload);

      if (response?.data?.status === 200) {
        showToast("success", "Éxito", "Contactos asociados correctamente.");
        return;
      }

      throw new Error(response?.data?.message || "No se pudieron guardar las asociaciones.");
    } catch (error) {
      showToast(
        "error",
        "Error",
        getFriendlyErrorMessage(error, "Ocurrió un error al guardar las asociaciones.")
      );
    } finally {
      setSaving(false);
    }
  }, [
    apiUrlGuardarAsociaciones,
    getFriendlyErrorMessage,
    selectedCliente,
    showToast,
    targetContactos,
  ]);

  const itemTemplate = useCallback(
    (item) => (
      <div className="association-contact-card">
        <div className="association-contact-card__row">
          <span className="association-contact-card__name">{item.nombreCa || "Sin nombre"}</span>
          <span className="association-contact-card__id">{item.identificacionCa || "Sin ID"}</span>
        </div>
        <div className="association-contact-card__row">
          <span>{item.correoCa || "Sin correo"}</span>
          <span>{item.telmovilCa || "Sin teléfono"}</span>
        </div>
      </div>
    ),
    []
  );

  const selectedClienteText = useMemo(
    () => selectedClienteLabel || "Aún no has seleccionado un cliente.",
    [selectedClienteLabel]
  );

  return (
    <div className="client-contact-association">
      <Toast ref={toast} />

      <div className="client-contact-association__header">
        <h2>Asociación de clientes y contactos</h2>
        <p>Busca un cliente, administra sus contactos y guarda los cambios en un solo paso.</p>
      </div>

      <Panel header="Seleccionar cliente" toggleable className="client-contact-association__panel">
        <Card className="client-contact-association__search-card">
          <div className="client-contact-association__search-grid">
            <FloatLabel>
              <IconField iconPosition="left" className="client-contact-association__search-field">
                <InputIcon className="pi pi-search" />
                <InputText
                  id="buscarclientes"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Escribe nombre, NIT o identidad"
                />
              </IconField>
              <label htmlFor="buscarclientes">Buscar cliente</label>
            </FloatLabel>

            <FloatLabel>
              <Dropdown
                inputId="clientes"
                value={selectedCliente}
                onChange={onClienteChange}
                options={clientes}
                optionLabel="label"
                optionValue="value"
                placeholder="Selecciona un cliente"
                filter
                filterBy="label"
                loading={loadingClientes}
                showClear
                className="client-contact-association__dropdown"
              />
              <label htmlFor="clientes">Cliente</label>
            </FloatLabel>
          </div>

          <div className="client-contact-association__summary">
            <i className="pi pi-user" />
            <span>{selectedClienteText}</span>
            {loadingClientes && <i className="pi pi-spin pi-spinner" />}
          </div>
        </Card>
      </Panel>

      <Card className="client-contact-association__picklist-card">
        <PickList
          dataKey="idcontacto"
          source={sourceContactos}
          target={targetContactos}
          itemTemplate={itemTemplate}
          filter
          filterBy="nombreCa,identificacionCa,telmovilCa,correoCa"
          sourceHeader="Contactos disponibles"
          targetHeader="Contactos asociados"
          sourceStyle={{ height: "320px" }}
          targetStyle={{ height: "320px" }}
          onChange={(event) => {
            setSourceContactos(event.source);
            setTargetContactos(event.target);
          }}
          showSourceControls={false}
          showTargetControls={false}
          sourceFilterPlaceholder="Buscar por nombre, identidad, teléfono o correo"
          targetFilterPlaceholder="Buscar por nombre, identidad, teléfono o correo"
          disabled={!selectedCliente || loadingContactos || saving}
          pt={{
            moveAllToTargetButton: { root: { className: "hidden" } },
            moveAllToSourceButton: { root: { className: "hidden" } },
          }}
        />

        <div className="client-contact-association__footer">
          <small>
            {selectedCliente
              ? `${targetContactos.length} contacto(s) asociado(s) actualmente.`
              : "Selecciona un cliente para comenzar."}
          </small>
          <Button
            onClick={handleSave}
            label={saving ? "Guardando..." : "Guardar asociaciones"}
            icon={saving ? "pi pi-spin pi-spinner" : "pi pi-save"}
            severity="success"
            disabled={!selectedCliente || loadingContactos || saving}
          />
        </div>
      </Card>
    </div>
  );
};

export default ClientContactAssociation;
