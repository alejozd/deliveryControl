import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";
import config from "../Config";
import "../styles/modules/contact-creation.css";

const INITIAL_CONTACT = {
  nombreCa: "",
  identificacionCa: "",
  telmovilCa: "",
  direccionCa: "",
  correoCa: "",
};


const ContactCreation = ({
  visible,
  onHide,
  idCliente,
  selectedContact,
  refreshContacts,
}) => {
  const apiUrlUpdateContact = `${config.apiUrl}/Datasnap/rest/TServerMethods1/UpdateContact`;
  const apiUrlAddContact = `${config.apiUrl}/Datasnap/rest/TServerMethods1/AddContact`;
  const apiUrlSegmentacion = `${config.apiUrl}/Datasnap/rest/TServerMethods1/ListaSegmentacion`;

  const [newContact, setNewContact] = useState(INITIAL_CONTACT);
  const [segmentos, setSegmentos] = useState([]);
  const [selectedSegmento, setSelectedSegmento] = useState(null);
  const [loadingSegmentos, setLoadingSegmentos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const toast = useRef(null);

  const isEditMode = Boolean(selectedContact?.idcontacto);

  const validateEmail = useCallback((email) => {
    const trimmedEmail = (email || "").trim();
    if (!trimmedEmail) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(trimmedEmail);
  }, []);

  const getFriendlyErrorMessage = useCallback((error, fallbackMessage) => {
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.response?.data?.error) return error.response.data.error;
    if (typeof error?.response?.data === "string") return error.response.data;
    if (error?.message) return error.message;
    return fallbackMessage;
  }, []);

  const formErrors = useMemo(() => {
    const errors = {};

    if (!newContact.nombreCa.trim()) {
      errors.nombreCa = "El nombre es obligatorio.";
    }

    if (!newContact.telmovilCa.trim()) {
      errors.telmovilCa = "El teléfono es obligatorio.";
    }

    if (!newContact.correoCa.trim()) {
      errors.correoCa = "El correo electrónico es obligatorio.";
    } else if (!validateEmail(newContact.correoCa)) {
      errors.correoCa = "Ingresa un correo electrónico válido.";
    }

    if (!selectedSegmento?.idsegmento) {
      errors.idsegmento = "Debes seleccionar un segmento.";
    }

    return errors;
  }, [newContact, selectedSegmento, validateEmail]);

  const isFormValid = useMemo(() => Object.keys(formErrors).length === 0, [formErrors]);

  const shouldShowFieldError = useCallback(
    (field) => (showValidationErrors || touchedFields[field]) && Boolean(formErrors[field]),
    [formErrors, showValidationErrors, touchedFields]
  );

  const markTouched = useCallback((field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handleFieldChange = useCallback((field, value) => {
    setNewContact((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetFormState = useCallback(() => {
    setNewContact(INITIAL_CONTACT);
    setSelectedSegmento(null);
    setTouchedFields({});
    setShowValidationErrors(false);
  }, []);

  const handleHide = useCallback(() => {
    resetFormState();
    onHide();
  }, [onHide, resetFormState]);

  useEffect(() => {
    let isMounted = true;

    const fetchSegmentos = async () => {
      setLoadingSegmentos(true);
      try {
        const response = await axios.get(apiUrlSegmentacion);
        if (isMounted) {
          setSegmentos(response?.data?.result || []);
        }
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: getFriendlyErrorMessage(error, "No se pudieron cargar los segmentos."),
          life: 3500,
        });
      } finally {
        if (isMounted) {
          setLoadingSegmentos(false);
        }
      }
    };

    fetchSegmentos();

    return () => {
      isMounted = false;
    };
  }, [apiUrlSegmentacion, getFriendlyErrorMessage]);

  useEffect(() => {
    if (!visible) {
      resetFormState();
      return;
    }

    if (selectedContact) {
      setNewContact({
        nombreCa: selectedContact.nombreCa || "",
        identificacionCa: selectedContact.identificacionCa || "",
        telmovilCa: selectedContact.telmovilCa || "",
        direccionCa: selectedContact.direccionCa || "",
        correoCa: selectedContact.correoCa || "",
      });

      const segmentoEncontrado =
        segmentos.find((segmento) => segmento.idsegmento === selectedContact.idsegmento) || null;
      setSelectedSegmento(segmentoEncontrado);
      setTouchedFields({});
      setShowValidationErrors(false);
    } else {
      resetFormState();
    }
  }, [selectedContact, segmentos, visible, resetFormState]);

  const saveContact = useCallback(async () => {
    setShowValidationErrors(true);

    if (!isFormValid) {
      toast.current?.show({
        severity: "warn",
        summary: "Campos pendientes",
        detail: "Completa los campos obligatorios para continuar.",
        life: 3000,
      });
      return;
    }

    const contactToSave = {
      ...newContact,
      idcliente: idCliente,
      idsegmento: selectedSegmento?.idsegmento,
    };

    setSaving(true);
    try {
      if (isEditMode) {
        const response = await axios.put(apiUrlUpdateContact, contactToSave);
        if (response?.data?.status === 200) {
          toast.current?.show({
            severity: "success",
            summary: "Éxito",
            detail: "Contacto actualizado correctamente.",
            life: 2500,
          });
          refreshContacts("Contacto actualizado", "success");
          handleHide();
          return;
        }

        throw new Error(response?.data?.message || "No se pudo actualizar el contacto.");
      }

      const response = await axios.post(apiUrlAddContact, contactToSave);

      if (response?.data?.status === 200) {
        toast.current?.show({
          severity: "success",
          summary: "Éxito",
          detail: "Contacto creado correctamente.",
          life: 2500,
        });
        refreshContacts("Contacto creado", "success");
        handleHide();
        return;
      }

      if (response?.data?.status === 204) {
        toast.current?.show({
          severity: "warn",
          summary: "Duplicado",
          detail: "El contacto ya existe.",
          life: 3000,
        });
        return;
      }

      throw new Error(response?.data?.message || "No se pudo crear el contacto.");
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: getFriendlyErrorMessage(error, "Ocurrió un error al guardar el contacto."),
        life: 3500,
      });
    } finally {
      setSaving(false);
    }
  }, [
    apiUrlAddContact,
    apiUrlUpdateContact,
    getFriendlyErrorMessage,
    handleHide,
    idCliente,
    isEditMode,
    isFormValid,
    newContact,
    refreshContacts,
    selectedSegmento,
  ]);

  const renderInputField = (fieldId, label, value, placeholder, required = false) => (
    <div className="contact-creation__field">
      <label htmlFor={fieldId}>
        {label}
        {required && <span className="contact-creation__required"> *</span>}
      </label>
      <InputText
        id={fieldId}
        value={value}
        placeholder={placeholder}
        onChange={(e) => handleFieldChange(fieldId, e.target.value)}
        onBlur={() => markTouched(fieldId)}
        className={shouldShowFieldError(fieldId) ? "p-invalid" : ""}
      />
      {shouldShowFieldError(fieldId) && (
        <small className="p-error">{formErrors[fieldId]}</small>
      )}
    </div>
  );

  const contactDialogFooter = (
    <div className="contact-creation__footer">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        text
        onClick={handleHide}
        disabled={saving}
      />
      <Button
        label={saving ? "Guardando..." : "Guardar"}
        icon={saving ? "pi pi-spin pi-spinner" : "pi pi-check"}
        onClick={saveContact}
        disabled={saving}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        header={isEditMode ? "Editar contacto" : "Nuevo contacto"}
        modal
        className="p-fluid contact-creation__dialog"
        footer={contactDialogFooter}
        onHide={handleHide}
        draggable={false}
      >
        <div className="contact-creation__header">
          <h4>{isEditMode ? "Actualiza la información de contacto" : "Crea un nuevo contacto"}</h4>
          <p>
            Los campos marcados con <strong>*</strong> son obligatorios.
          </p>
        </div>

        <div className="contact-creation__grid">
          {renderInputField("nombreCa", "Nombre", newContact.nombreCa, "Nombre completo", true)}

          {renderInputField(
            "identificacionCa",
            "Identificación",
            newContact.identificacionCa,
            "NIT, DPI o identificación"
          )}

          {renderInputField("telmovilCa", "Teléfono", newContact.telmovilCa, "Ej. 5555-5555", true)}

          {renderInputField("correoCa", "Correo electrónico", newContact.correoCa, "correo@dominio.com", true)}

          <div className="contact-creation__field contact-creation__field--full">
            <label htmlFor="direccionCa">Dirección</label>
            <InputText
              id="direccionCa"
              value={newContact.direccionCa}
              placeholder="Dirección de contacto"
              onChange={(e) => handleFieldChange("direccionCa", e.target.value)}
            />
          </div>

          <div className="contact-creation__field contact-creation__field--full">
            <label htmlFor="idsegmento">
              Segmento<span className="contact-creation__required"> *</span>
            </label>
            <Dropdown
              id="idsegmento"
              value={selectedSegmento}
              onChange={(e) => {
                setSelectedSegmento(e.value);
                markTouched("idsegmento");
              }}
              onBlur={() => markTouched("idsegmento")}
              options={segmentos}
              optionLabel="nombresegmento"
              placeholder={loadingSegmentos ? "Cargando segmentos..." : "Selecciona un segmento"}
              loading={loadingSegmentos}
              filter
              className={shouldShowFieldError("idsegmento") ? "p-invalid" : ""}
              panelClassName="contact-creation__dropdown-panel"
            />
            {shouldShowFieldError("idsegmento") && (
              <small className="p-error">{formErrors.idsegmento}</small>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ContactCreation;
