import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import axios from "axios";
import { Dropdown } from "primereact/dropdown";
import config from "../Config";

const ContactCreation = ({
  visible,
  onHide,
  idCliente,
  selectedContact, // null si es creación, contiene los datos si es edición
  refreshContacts,
}) => {
  const apiUrlUpdateContact = `${config.apiUrl}/Datasnap/rest/TServerMethods1/UpdateContact`;
  const apiUrlAddContact = `${config.apiUrl}/Datasnap/rest/TServerMethods1/AddContact`;
  const apiUrlSegmentacion = `${config.apiUrl}/Datasnap/rest/TServerMethods1/ListaSegmentacion`;

  const [newContact, setNewContact] = useState({
    nombreCa: "",
    identificacionCa: "",
    telmovilCa: "",
    direccionCa: "",
    correoCa: "",
  });

  const [segmentos, setSegmentos] = useState([]);
  const [selectedSegmento, setSelectedSegmento] = useState(null);
  const [emailError, setEmailError] = useState(false);
  const toast = useRef(null);

  // Función para validar el correo electrónico
  const validateEmail = (email) => {
    if (email.trim() === "") return true; // correo vacío es válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email);
  };

  // Función para manejar el cambio de correo
  const handleEmailChange = (e) => {
    const email = e.target.value;
    setNewContact({ ...newContact, correoCa: email });
    setEmailError(!validateEmail(email));
  };

  // Cargar segmentos cuando el componente se monta
  useEffect(() => {
    const fetchSegmentos = async () => {
      try {
        const response = await axios.get(apiUrlSegmentacion);
        setSegmentos(response.data.result || []);
      } catch (error) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Error al cargar segmentos",
          life: 3000,
        });
      }
    };
    fetchSegmentos();
  }, [apiUrlSegmentacion]);

  // Montar datos del contacto si es una edición
  useEffect(() => {
    if (selectedContact) {
      // Si estamos editando, llenar los campos con los datos del contacto
      setNewContact({
        nombreCa: selectedContact.nombreCa || "",
        identificacionCa: selectedContact.identificacionCa || "",
        telmovilCa: selectedContact.telmovilCa || "",
        direccionCa: selectedContact.direccionCa || "",
        correoCa: selectedContact.correoCa || "",
      });
      setSelectedSegmento(
        segmentos.find((s) => s.idsegmento === selectedContact.idsegmento) ||
          null
      );
    } else {
      // Si es creación, vaciar los campos
      setNewContact({
        nombreCa: "",
        identificacionCa: "",
        telmovilCa: "",
        direccionCa: "",
        correoCa: "",
      });
      setSelectedSegmento(null);
    }
  }, [selectedContact, segmentos]);

  // Función para guardar el contacto (creación o actualización)
  const saveContact = async () => {
    if (!validateEmail(newContact.correoCa)) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Correo electrónico inválido",
        life: 3000,
      });
      return;
    }

    const contactToSave = {
      ...newContact,
      idcliente: idCliente,
      idsegmento: selectedSegmento?.idsegmento,
    };
    console.log("contactToSave", contactToSave);

    try {
      if (selectedContact && selectedContact.idcontacto) {
        // Edición: Actualizar el contacto
        const response = await axios.put(apiUrlUpdateContact, contactToSave);
        if (response.data.status === 200) {
          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: "Contacto actualizado correctamente",
            life: 3000,
          });
          onHide(); // Cerrar el diálogo
          refreshContacts("Contacto actualizado", "success"); // Actualiza la lista de contactos
        } else {
          throw new Error(
            response.data.message || "Error al actualizar el contacto"
          );
        }
      } else {
        // Creación: Agregar el nuevo contacto
        const response = await axios.post(apiUrlAddContact, contactToSave);
        if (response.data.status === 200) {
          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: "Contacto creado correctamente",
            life: 3000,
          });
          onHide(); // Cerrar el diálogo
          refreshContacts("Contacto creado", "success"); // Actualiza la lista de contactos
        } else if (response.data.status === 204) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "El contacto ya existe",
            life: 3000,
          });
        } else {
          throw new Error(
            response.data.message || "Error al crear el contacto"
          );
        }
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message,
        life: 3000,
      });
    }
  };

  const contactDialogFooter = (
    <React.Fragment>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        severity="danger"
        text
        raised
        onClick={onHide}
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        severity="success"
        outlined
        onClick={saveContact}
      />
    </React.Fragment>
  );

  return (
    <div>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        style={{ width: "450px" }}
        header="Detalles del Contacto"
        modal
        className="p-fluid"
        footer={contactDialogFooter}
        onHide={onHide}
      >
        <div className="labelinput">
          <label htmlFor="nombreCa">Nombre</label>
          <InputText
            className="inputtext"
            id="nombreCa"
            value={newContact.nombreCa}
            onChange={(e) =>
              setNewContact({ ...newContact, nombreCa: e.target.value })
            }
          />
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div className="labelinput">
            <label htmlFor="identificacionCa">Identificación</label>
            <InputText
              className="inputtext"
              id="identificacionCa"
              value={newContact.identificacionCa}
              onChange={(e) =>
                setNewContact({
                  ...newContact,
                  identificacionCa: e.target.value,
                })
              }
            />
          </div>
          <div className="labelinput">
            <label htmlFor="telmovilCa">Teléfono</label>
            <InputText
              className="inputtext"
              id="telmovilCa"
              value={newContact.telmovilCa}
              onChange={(e) =>
                setNewContact({ ...newContact, telmovilCa: e.target.value })
              }
            />
          </div>
        </div>
        <div className="labelinput">
          <label htmlFor="direccionCa">Dirección</label>
          <InputText
            className="inputtext"
            id="direccionCa"
            value={newContact.direccionCa}
            onChange={(e) =>
              setNewContact({ ...newContact, direccionCa: e.target.value })
            }
          />
        </div>
        <div className="labelinput">
          <label htmlFor="correoCa">Correo electrónico</label>
          <InputText
            id="correoCa"
            value={newContact.correoCa || ""}
            onChange={handleEmailChange}
            className={`inputtext ${emailError ? "p-invalid" : ""}`}
            placeholder="example@mail.com"
          />
        </div>
        <div className="labelinput">
          <label htmlFor="idsegmento">Segmento</label>
          <Dropdown
            className="inputtext"
            id="idsegmento"
            value={selectedSegmento}
            onChange={(e) => setSelectedSegmento(e.value)}
            options={segmentos}
            optionLabel="nombresegmento"
            placeholder="Seleccionar Segmento"
            required
          />
        </div>
      </Dialog>
    </div>
  );
};

export default ContactCreation;
