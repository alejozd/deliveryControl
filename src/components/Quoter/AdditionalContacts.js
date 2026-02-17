import React, { useState, useRef, useEffect, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Toolbar } from "primereact/toolbar";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import ContactSearchDialog from "./ContactSearchDialog";
import config from "../../Config";
import axios from "axios";

const AdditionalContacts = ({
  contacts,
  setContacts,
  selectedContact,
  onContactSelect,
  idCliente,
}) => {
  const apiUrlUpdateContact = `${config.apiUrl}/Datasnap/rest/TServerMethods1/UpdateContact`;
  const apiUrlAddContact = `${config.apiUrl}/Datasnap/rest/TServerMethods1/AddContact`;
  // const apiUrlDeleteContact = `${config.apiUrl}/Datasnap/rest/TServerMethods1/DeleteContact`;
  const apiUrlUnMatchContact = `${config.apiUrl}/Datasnap/rest/TServerMethods1/DesAsociarContacto`;
  const apiUrlSegmentacion = `${config.apiUrl}/Datasnap/rest/TServerMethods1/ListaSegmentacion`;
  const apiUrlGuardarAsociaciones = `${config.apiUrl}/Datasnap/rest/TServerMethods1/AsociarContacto`;
  const [expandedRows, setExpandedRows] = useState(null);
  const [contactDialog, setContactDialog] = useState(false);
  const [newContact, setNewContact] = useState({
    nombreCa: "",
    identificacionCa: "",
    telmovilCa: "",
    direccionCa: "",
    correoCa: "",
  });
  const toast = useRef(null);
  const [emailError, setEmailError] = useState(false);
  const [selectedContactsrows, setSelectedContactsrows] = useState([]);
  const [selectedContactBeforeEdit, setSelectedContactBeforeEdit] =
    useState(null);
  const [segmentos, setSegmentos] = useState([]);
  const [selectedSegmento, setSelectedSegmento] = useState(null);
  const [showDialogContact, setShowDialogContact] = useState(false);

  useEffect(() => {
    // Establece el contacto seleccionado en el DataTable
    if (selectedContact) {
      let contact = null;
      for (let i = 0; i < contacts.length; i++) {
        if (parseInt(contacts[i].idcontacto) === parseInt(selectedContact)) {
          contact = contacts[i];
          break;
        }
      }
      setSelectedContactsrows(contact);
    }
  }, [selectedContact, contacts]);

  const fetchSegmentos = useCallback(async () => {
    try {
      const response = await axios.get(apiUrlSegmentacion);
      if (response.status === 200) {
        setSegmentos(response.data.result);
      } else {
        console.error("Error fetching segmentos:", response.data.error);
      }
    } catch (error) {
      console.error("Error fetching segmentos:", error);
    }
  }, [apiUrlSegmentacion]);

  useEffect(() => {
    fetchSegmentos();
  }, [fetchSegmentos]);

  const validateEmail = (email) => {
    // Si el correo está vacío, se considera válido
    if (email.trim() === "") {
      return true;
    } else {
      // Si se ingresa algo en el correo, se valida la estructura del correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      return emailRegex.test(email);
    }
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setNewContact({ ...newContact, correoCa: email });
    setEmailError(!validateEmail(email));
  };

  const onRowExpand = (event) => {
    toast.current.show({
      severity: "info",
      summary: "Contacto expandido",
      detail: event.data.nombreCa,
      life: 3000,
    });
  };

  const onRowCollapse = (event) => {
    toast.current.show({
      severity: "success",
      summary: "Cerrando Contacto",
      detail: event.data.nombreCa,
      life: 3000,
    });
  };

  const openSearch = () => {
    setShowDialogContact(true); // Mostrar el diálogo de búsqueda de contactos
  };

  const handleAcceptSelection = async (selectedContactData) => {
    // Aquí puedes manejar lo que sucede cuando se selecciona un contacto
    // console.log("Contacto seleccionado:", selectedContactData);
    // console.log("idCliente: ", idCliente);
    // Aquí obtienes el array de contactos
    const contactos = [...contacts, selectedContactData]; // El array de contactos seleccionado

    try {
      // Realizar la solicitud PUT al endpoint
      // Enviar los datos al backend
      const response = await axios.put(apiUrlGuardarAsociaciones, {
        idcliente: idCliente,
        contactos: contactos.map((contacto) => ({
          idcontacto: contacto.idcontacto,
        })),
      });

      console.log("Respuesta del servidor:", response.data);

      if (response.data.status === 200) {
        // Si la respuesta fue exitosa, actualiza el estado de los contactos
        setContacts(contactos);
      } else {
        console.error("Error al asociar contactos:", response.data.error);
        // Manejar el error, mostrar mensaje al usuario, etc.
      }
    } catch (error) {
      console.error("Error al asociar contactos:", error);
      // Manejar el error, mostrar mensaje al usuario, etc.
    }
    // setContacts([...contacts, selectedContactData]); // Agregar el contacto seleccionado a la lista de contactos
  };

  const handleContactCreated = (newContact) => {
    // Aquí puedes manejar lo que sucede cuando se crea un nuevo contacto
    console.log("Nuevo contacto creado:", newContact);
    setContacts([...contacts, newContact]); // Agregar el nuevo contacto a la lista de contactos
  };

  const saveContact = async () => {
    // Validar el formato del correo electrónico
    if (!validateEmail(newContact.correoCa)) {
      // Mostrar mensaje de error si el correo electrónico es inválido
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Correo electrónico inválido",
        life: 3000,
      });
      // Detener el proceso de guardado
      return;
    }
    // Agregar idcliente a newContact
    const contactToSave = {
      ...newContact,
      idcliente: idCliente,
      idsegmento: selectedSegmento?.idsegmento,
    };
    if (contactToSave.idcontacto) {
      const updatedContacts = contacts.map((contact) =>
        contact.idcontacto === contactToSave.idcontacto
          ? contactToSave
          : contact
      );
      setContacts(updatedContacts);
      // Enviar solicitud PUT para actualizar el contacto existente
      const response = await axios.put(apiUrlUpdateContact, contactToSave);
      if (response.data.status === 200) {
        console.log("Contacto actualizado:", response.data);
      } else {
        console.error("Error al actualizar el contacto:", response.data.error);
      }
      setSelectedContactsrows(selectedContactBeforeEdit);
    } else {
      // Enviar solicitud POST para agregar el nuevo contacto
      const response = await axios.post(apiUrlAddContact, contactToSave);
      if (response.data.status === 200) {
        // console.log("Contacto agregado:", response.data);
        setNewContact({
          ...contactToSave,
          idcontacto: response.data.idcontacto,
        });
        setContacts([
          ...contacts,
          { ...contactToSave, idcontacto: response.data.idcontacto },
        ]);
      } else if (response.data.status === 204) {
        // console.log("El contacto ya existe: ", response.data.message);
        toast.current.show({
          severity: "error",
          summary: "Contacto Existente",
          detail: response.data.message,
          life: 3000,
        });
      } else {
        console.error("Error al agregar el contacto:", response.data.error);
      }
    }

    setContactDialog(false);
  };

  const editContact = (contact) => {
    setSelectedContactBeforeEdit(selectedContactsrows);
    setNewContact(contact);
    // setSelectedContact(contact);
    setSelectedSegmento(
      segmentos.find((v) => v.idsegmento === contact.idsegmento) || null
    );
    setContactDialog(true);
  };

  const deleteContact = async (contact) => {
    try {
      const datos = {
        idcliente: idCliente,
        idcontacto: contact.idcontacto,
      };
      const response = await axios.put(apiUrlUnMatchContact, datos);
      if (response.data.status === 200) {
        // Si la eliminación fue exitosa, actualiza el estado de los contactos
        setContacts(
          contacts.filter((c) => c.idcontacto !== contact.idcontacto)
        );
        console.log("Contacto desasociado:", response.data);
      } else {
        console.error("Error al desasociar el contacto:", response.data.error);
      }
    } catch (error) {
      console.error("Error al desasociar el contacto:", error.message);
    }
  };

  const rowExpansionTemplate = (data) => {
    return (
      <div className="card p-grid p-fluid">
        <div className="labelinput">
          <label htmlFor="nombreCa">Nombre</label>
          <InputText
            className="inputtext"
            id="nombreCa"
            value={data.nombreCa}
            readOnly
          />
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div className="labelinput">
            <label htmlFor="identificacionCa">Identificación</label>
            <InputText
              className="inputtext"
              id="identificacionCa"
              value={data.identificacionCa}
              readOnly
            />
          </div>
          <div className="labelinput">
            <label htmlFor="telmovilCa">Teléfono</label>
            <InputText
              className="inputtext"
              id="telmovilCa"
              value={data.telmovilCa}
              readOnly
            />
          </div>
        </div>
        <div className="labelinput">
          <label htmlFor="direccionCa">Dirección</label>
          <InputText
            className="inputtext"
            id="direccionCa"
            value={data.direccionCa}
            readOnly
          />
        </div>
        <div className="labelinput">
          <label htmlFor="correoCa">Correo electrónico</label>
          <InputText
            className="inputtext"
            id="correoCa"
            value={data.correoCa}
            readOnly
          />
        </div>
        <div className="labelinput">
          <label htmlFor="nombresegmento">Segmento</label>
          <InputText
            className="inputtext"
            id="nombresegmento"
            value={
              segmentos.find((v) => v.idsegmento === data.idsegmento)
                ?.nombresegmento || ""
            }
            readOnly
          />
        </div>
      </div>
    );
  };

  const leftToolbarTemplate = () => {
    return (
      <div className="quoter-contacts-toolbar__group">
        <Button
          // label="buscar"
          icon="pi pi-search"
          severity="warning"
          size="small"
          text
          className="quoter-contacts-toolbar__btn"
          // rounded
          tooltip="Buscar contacto"
          onClick={openSearch}
        />
      </div>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <div className="quoter-contacts-toolbar__group">
        <Button
          // label="Editar"
          icon="pi pi-pencil"
          severity="help"
          className="quoter-contacts-toolbar__btn"
          size="small"
          text
          tooltip="Editar contacto"
          onClick={() => editContact(selectedContactsrows)}
          disabled={contacts.length === 0}
        />
        <Button
          icon="pi pi-minus-circle"
          severity="danger"
          size="small"
          text
          className="quoter-contacts-toolbar__btn"
          tooltip="Desligar contacto"
          onClick={() => deleteContact(selectedContactsrows)}
          disabled={contacts.length === 0}
        />
      </div>
    );
  };

  const contactDialogFooter = (
    <React.Fragment>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        // className="p-button-text"
        severity="danger"
        text
        raised
        onClick={() => {
          setContactDialog(false);
          setNewContact({
            nombreCa: "",
            identificacionCa: "",
            telmovilCa: "",
            direccionCa: "",
            correoCa: "",
          });
          setSelectedSegmento(null);
        }}
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
      <div>
        <Toolbar
          className="quoter-contacts-toolbar"
          start={leftToolbarTemplate}
          end={rightToolbarTemplate}
        />
      </div>
      <DataTable
        value={contacts}
        rows={4}
        expandedRows={expandedRows}
        emptyMessage="No hay contactos disponibles"
        onRowToggle={(e) => setExpandedRows(e.data)}
        onRowExpand={onRowExpand}
        onRowCollapse={onRowCollapse}
        rowExpansionTemplate={rowExpansionTemplate}
        // header={header}
        dataKey="idcontacto"
        showHeaders={false}
        // tableStyle={{ minWidth: '60rem' }}
        selection={selectedContactsrows}
        // onSelectionChange={handleRowSelect}
        onSelectionChange={(e) => {
          setSelectedContactsrows(e.value);
          onContactSelect(e.value);
        }}
        scrollable
      >
        <Column
          selectionMode="single"
          headerStyle={{ width: "1em" }}
          bodyStyle={{ width: "1em" }}
        />
        <Column expander style={{ width: "3em" }} />
        <Column field="nombreCa" header="Nombre" />
        <Column field="identificacionCa" header="Identificación" hidden />
        <Column field="telmovilCa" header="Teléfono" hidden />
      </DataTable>

      <Dialog
        visible={contactDialog}
        style={{ width: "450px" }}
        header="Detalles del Contacto"
        modal
        className="p-fluid"
        footer={contactDialogFooter}
        onHide={() => {
          setContactDialog(false);
          setNewContact({
            nombreCa: "",
            identificacionCa: "",
            telmovilCa: "",
            direccionCa: "",
            correoCa: "",
          });
          setSelectedSegmento(null);
        }}
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
            // value={newContact.correoCa}
            // onChange={(e) =>
            // setNewContact({ ...newContact, correoCa: e.target.value })}
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
      <ContactSearchDialog
        showDialogContact={showDialogContact}
        setShowDialogContact={setShowDialogContact}
        onAcceptSelection={handleAcceptSelection}
        onContactCreated={handleContactCreated}
        idCliente={idCliente}
      />
    </div>
  );
};

export default AdditionalContacts;
