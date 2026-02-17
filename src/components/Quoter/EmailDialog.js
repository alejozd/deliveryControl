import { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { RadioButton } from "primereact/radiobutton";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import ComprobantePDF from "./ComprobantePDF";
import config from "../../Config";
import axios from "axios";

const EmailDialog = ({ visible, onHide, selectedQuote }) => {
  const apiUrlContactos = `${config.apiUrl}/Datasnap/rest/TServerMethods1/DataContactosCliente`;
  const apiSendEmail = `${config.apiUrl}/Datasnap/rest/TServerMethods1/SendEmail`;
  const [emailOptions, setEmailOptions] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    if (selectedQuote) {
      fetchContactsAndClient();
    }
  }, [selectedQuote]);

  useEffect(() => {
    if (visible) {
      setSelectedEmail(null);
    }
  }, [visible]);

  const fetchContactsAndClient = async () => {
    try {
      const response = await axios.put(apiUrlContactos, {
        idcliente: selectedQuote.cliente.idcliente,
      });

      if (response.data.status === 200) {
        const cliente = response.data.cliente[0];
        const contacts = response.data.contactos;

        const listacorreos = [
          {
            nombre: cliente.nombreclienteCa,
            key: cliente.idclienteCa,
            email: cliente.emailclienteCa,
          },
          ...contacts.map((contact) => ({
            nombre: contact.nombreCa,
            key: contact.idcontacto,
            email: contact.emailCa,
          })),
        ].filter((option) => option.email);

        setEmailOptions(listacorreos);
      } else {
        console.error("Error fetching data:", response.data.error);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSendEmail = async (pdfBlob) => {
    if (selectedEmail) {
      setLoading(true);
      const reader = new FileReader();
      reader.readAsDataURL(pdfBlob);
      reader.onloadend = async () => {
        const base64data = reader.result.split(",")[1]; // Extraer solo la parte de base64
        const jsonPayload = JSON.stringify({
          to: selectedEmail.email,
          pdf: base64data,
        });

        try {
          const response = await axios.post(apiSendEmail, jsonPayload, {
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.data.status === 200) {
            toast.current.show({
              severity: "success",
              summary: "Correo Enviado",
              detail: "Correo enviado al cliente correctamente",
              life: 3500,
            });
            // console.log("Correo enviado al cliente correctamente");
          } else {
            toast.current.show({
              severity: "error",
              summary: "Error",
              detail: "Error enviando correo al cliente",
              life: 3500,
            });
            console.error("Error enviando correo al cliente");
          }
        } catch (error) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Error enviando correo",
            life: 3500,
          });
          console.error("Error enviando correo:", error);
        }
      };
      setLoading(false);
    } else {
      console.error("Correo no seleccionado");
    }
    setGeneratingPDF(false);
    onHide();
  };

  const handleGenerateAndSendPDF = () => {
    setGeneratingPDF(true);
  };

  const handlePDFGenerated = (pdfBlob) => {
    handleSendEmail(pdfBlob);
    // setGeneratingPDF(false);
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
        header="Enviar mensaje por Correo Electrónico"
      >
        <div className="card flex justify-content-center">
          <div className="flex flex-column gap-3">
            <h3>Selecciona un correo electrónico</h3>
            {emailOptions.length > 0 ? (
              emailOptions.map((option) => (
                <div key={option.key}>
                  <RadioButton
                    inputId={`email-${option.key}`}
                    name="email"
                    value={option}
                    onChange={() => setSelectedEmail(option)}
                    checked={selectedEmail && selectedEmail.key === option.key}
                  />
                  <label
                    htmlFor={`email-${option.key}`}
                    style={{ marginLeft: "5px" }}
                  >
                    {option.nombre} - <strong>{option.email}</strong>
                  </label>
                </div>
              ))
            ) : (
              <p>No hay correos electrónicos disponibles</p>
            )}
          </div>
        </div>
        <Button
          label="Enviar"
          icon="pi pi-check"
          severity="success"
          loading={loading}
          onClick={handleGenerateAndSendPDF}
          disabled={!selectedEmail || generatingPDF}
        />
        {generatingPDF && (
          <ComprobantePDF
            datos={selectedQuote}
            autoGenerate={true}
            onPDFGenerated={handlePDFGenerated}
          />
        )}
      </Dialog>
    </>
  );
};

export default EmailDialog;
