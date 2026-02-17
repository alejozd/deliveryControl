import React, { useMemo, useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";
import config from "./Config";
import "./styles/base/login.css";

const INITIAL_FORM = {
  nombre: "",
  clave: "",
};

const getFieldError = (name, value) => {
  const cleanedValue = value.trim();

  if (name === "nombre" && !cleanedValue) {
    return "El usuario es obligatorio.";
  }

  if (name === "clave" && !cleanedValue) {
    return "La contraseña es obligatoria.";
  }

  return "";
};

const getFriendlyLoginError = (error, fallbackMessage) => {
  if (fallbackMessage) return fallbackMessage;

  const rawMessage = String(error?.message || "");

  if (
    rawMessage.includes("Network Error") ||
    rawMessage.includes("Failed to fetch")
  ) {
    return "No se pudo conectar al servidor. Verifica tu conexión e inténtalo nuevamente.";
  }

  return "No fue posible iniciar sesión. Valida tus credenciales e inténtalo de nuevo.";
};

const Login = ({ onLoginSuccess }) => {
  const apiUrl = useMemo(
    () => `${config.apiUrl}/Datasnap/rest/TServerMethods1/Login`,
    []
  );

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formValues, setFormValues] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({ nombre: false, clave: false });

  const fieldErrors = useMemo(
    () => ({
      nombre: getFieldError("nombre", formValues.nombre),
      clave: getFieldError("clave", formValues.clave),
    }),
    [formValues]
  );

  const isFormInvalid = Boolean(fieldErrors.nombre || fieldErrors.clave);

  const updateField = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setTouched({ nombre: true, clave: true });
    if (isFormInvalid) return;

    try {
      setLoading(true);
      const response = await axios.post(apiUrl, {
        nombre: formValues.nombre.trim(),
        clave: formValues.clave,
      });

      if (response?.data?.status === 200) {
        onLoginSuccess({
          name: response.data.nombre,
          codigo: response.data.codigo,
          modvencli: response.data.modvencli,
        });
        return;
      }

      setErrorMessage(
        getFriendlyLoginError(
          null,
          response?.data?.error || response?.data?.message
        )
      );
    } catch (error) {
      setErrorMessage(getFriendlyLoginError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <Card className="login-card">
        <header className="login-card__brand">
          <h1>Control de Entregas</h1>
          <p>Ingresa con tus credenciales para continuar.</p>
        </header>

        <Divider className="login-divider" />

        <form onSubmit={handleSubmit} noValidate className="login-form">
          <div className="login-field">
            <label htmlFor="nombre">Usuario</label>
            <span className="p-input-icon-left login-icon-field">
              <i className="pi pi-user" />
              <InputText
                id="nombre"
                name="nombre"
                autoComplete="username"
                placeholder="Ingresa tu usuario"
                value={formValues.nombre}
                onChange={(e) => updateField("nombre", e.target.value)}
                onBlur={() => handleBlur("nombre")}
                className={touched.nombre && fieldErrors.nombre ? "p-invalid" : ""}
              />
            </span>
            {touched.nombre && fieldErrors.nombre && (
              <small className="login-field__error">{fieldErrors.nombre}</small>
            )}
          </div>

          <div className="login-field">
            <label htmlFor="clave">Contraseña</label>
            <span className="p-input-icon-left login-icon-field login-icon-field--password">
              <i className="pi pi-lock" />
              <Password
                inputId="clave"
                name="clave"
                autoComplete="current-password"
                placeholder="Ingresa tu contraseña"
                value={formValues.clave}
                onChange={(e) => updateField("clave", e.target.value)}
                onBlur={() => handleBlur("clave")}
                toggleMask
                feedback={false}
                className="login-password"
                inputClassName={
                  touched.clave && fieldErrors.clave
                    ? "p-invalid login-password__input"
                    : "login-password__input"
                }
              />
            </span>
            {touched.clave && fieldErrors.clave && (
              <small className="login-field__error">{fieldErrors.clave}</small>
            )}
          </div>

          {errorMessage && (
            <Message severity="error" text={errorMessage} className="login-message" />
          )}

          <Button
            type="submit"
            label="Iniciar sesión"
            icon="pi pi-sign-in"
            className="login-submit"
            loading={loading}
            disabled={loading || isFormInvalid}
          />
        </form>
      </Card>
    </main>
  );
};

export default React.memo(Login);
