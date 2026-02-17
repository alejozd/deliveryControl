import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import config from "../Config";
import axios from "axios";

const Potradatos = ({
  visible,
  onHide,
  idCliente,
  aceptaTratamiento,
  onAccept,
}) => {
  const apiUrl = `${config.apiUrl}/Datasnap/rest/TServerMethods1/PoTraDatos`;
  const [loading, setLoading] = useState(false);
  const handleAccept = async () => {
    try {
      setLoading(true);
      if (idCliente) {
        //console.log("potradatos.idCliente:", idCliente);
        await axios.post(apiUrl, {
          idcliente: idCliente,
          aceptapotradatos: 1, // Indica que acepta el tratamiento de datos
        });
      }
      //console.log(response.data);
      // Aquí podrías realizar alguna acción adicional si es necesario
      onAccept(); // Llama a la función de aceptar del padre
    } catch (error) {
      console.error("Error al actualizar tratamiento de datos:", error.message);
    } finally {
      setLoading(false);
      onHide(); // Oculta el diálogo después de enviar la solicitud
    }
  };

  const handleDecline = () => {
    onHide(); // Oculta el diálogo sin realizar ninguna acción
  };

  return (
    <div className="card flex justify-content-center">
      <Dialog
        visible={visible && aceptaTratamiento === 0} // Mostrar solo si no ha aceptado
        onHide={onHide}
        header="Política de Tratamiento de Datos Personales"
        style={{ width: "50vw" }}
        footer={
          <div>
            <Button
              label="No Acepto"
              icon="pi pi-times"
              className="p-button-text"
              onClick={handleDecline}
            />
            <Button
              label="Acepto"
              icon="pi pi-check"
              onClick={handleAccept}
              disabled={loading}
            />
          </div>
        }
        closeOnEscape={false}
      >
        <p className="m-0">
          <b>1- Objeto de esta Política</b>
          <p className="mb-5">
            Distribuidora Metroceramicas tiene un alto compromiso por ofrecer
            productos de calidad y una excelente atención al cliente, por tal
            motivo estamos comprometidos en proteger la privacidad de sus datos
            personales. Con la presente política se establecen los lineamientos
            generales para el manejo de datos personales de nuestros clientes,
            proveedores, contratistas y terceros, vinculados a Metroceramicas.
            En cumplimiento a lo consagrado en el artículo 13 del Decreto 1377
            de 2013, Metroceramicas adopta y hace público a todos los
            interesados el presente documento con el cual se da cumplimiento de
            la legislación colombiana correspondiente a la Protección de Datos
            Personales y garantizando el respeto por el derecho fundamental a la
            Protección de Datos Personales. Por favor, lea la siguiente
            información acerca de nuestra política de privacidad.
          </p>
        </p>
        <p className="mb-5">
          <b>2- Alcance </b>
          <p className="mb-5">
            La Política de Tratamiento y Protección de Datos Personales
            presentada a continuación, se aplicará a todas las Bases de Datos
            y/o Archivos que contengan datos personales y que sean objeto de
            tratamiento por Metroceramicas.
          </p>
        </p>
        <p className="mb-5">
          <b>3- Definiciones</b>
          <p className="mb-3">
            <b>Autorización:</b> Consentimiento previo, expreso e informado del
            Titular para llevar a cabo el Tratamiento de los Datos Personales.
          </p>
          <b>Aviso de Privacidad:</b>
          <p className="mb-3">
            Comunicación verbal o escrita generada por Metroceramicas, dirigida
            al Titular para el tratamiento de sus datos personales, mediante la
            cual se le informa acerca de la existencia de las Políticas de
            Tratamiento de información que le serán aplicables, la forma de
            acceder a las mismas y las finalidades del tratamiento que se
            pretende dar a los datos personales.
          </p>
          <b>Base de Datos:</b>
          <p className="mb-3">
            Conjunto organizado de Datos Personales que sean objeto de
            Tratamiento.
          </p>
          <b>Dato Personal:</b>
          <p className="mb-3">
            Cualquier información vinculada o que pueda asociarse a una o varias
            personas naturales determinadas o determinables.
          </p>
          <b>Dato Público:</b>
          <p className="mb-3">
            Dato Personal calificado como público por la ley o la Constitución
            Política. Son públicos, entre otros, los datos relativos al estado
            civil de las personas, a su profesión u oficio, a su calidad de
            comerciante o de servidor público. Dato Sensible: Dato Personal cuyo
            uso afecta la intimidad del Titular o cuyo uso indebido puede
            generar su discriminación, tales como aquellos que revelen el origen
            racial o étnico, la orientación política, las convicciones
            religiosas o filosóficas, la pertenencia a sindicatos,
            organizaciones sociales, de derechos humanos o que promueva
            intereses de cualquier partido político o que garanticen los
            derechos y garantías de partidos políticos de oposición así como los
            datos relativos a la salud, a la vida sexual y los datos
            biométricos.
          </p>
          <b>Titular:</b>
          <p className="mb-3">
            Persona natural cuyos datos personales son objeto de Tratamiento.
          </p>
          <b>Tratamiento:</b>
          <p className="mb-3">
            Es cualquier operación o conjunto de operaciones sobre Datos
            Personales tales como la recolección, almacenamiento, uso,
            circulación o supresión.
          </p>
          <b>Transferencia:</b>
          <p className="mb-3">
            Consiste en el envío de los Datos Personales a un receptor que, a su
            vez, es responsable del Tratamiento.
          </p>
          <b>Transmisión:</b>
          <p className="mb-3">
            Tratamiento de datos personales que implica la comunicación de los
            mismos dentro o fuera del territorio de la República de Colombia
            cuando tenga por objeto la realización de un tratamiento por el
            Encargado por cuenta del Responsable.
          </p>
        </p>
        <p className="mb-5">
          <b>
            4- Tratamiento al cual serán sometidos los datos y finalidad del
            mismo
          </b>
          <p className="mb-5">
            Los datos personales que se encuentren registrados en las bases de
            datos de Metroceramicas, serán tratados conforme a los principios
            rectores para el Tratamiento de Datos Personales y disposiciones
            contenidas en la Ley 1581 de 2012 y serán utilizados para el
            desarrollo del objeto social de Metroceramicas y de la relación
            contractual que lo vincula con el Titular de Datos Personales, en
            caso de existir, y en particular para: a) Desarrollar relaciones
            comerciales con terceros. b) Informar sobre nuevos productos o
            servicios. c) Realizar tratamientos estadísticos de sus datos. d)
            Evaluar la calidad de productos o servicios. e) Desarrollar
            actividades de mercadeo y promocionales. f) Transmitir información
            comercial, publicitaria o promocional sobre los productos y/o
            servicios, eventos y/o promociones, con el fin de impulsar, invitar,
            dirigir, ejecutar, informar y de manera general, llevar a cabo
            campañas, promociones o concursos. g) Realizar estudios internos
            sobre el cumplimiento de las relaciones comerciales y estudios de
            mercado. h) Dar cumplimiento a obligaciones contraídas con el
            Titular. i) Responder requerimientos legales de entidades
            administrativas y judiciales. j) Para la expedición de cotizaciones,
            facturas y demás documentos como soporte de una transacción. k) Para
            el despacho de pedidos y prestación de servicios contratados por el
            Titular. l) Atención del trámite de garantías y devolución de
            productos. m) Para cualquier finalidad adicional que sea debidamente
            autorizada por el Titular.
          </p>
        </p>
        <p className="mb-5">
          <b>5- Autorización</b>
          <p className="mb-5">
            A través de esta política de privacidad, el titular de manera
            expresa, previa, consiente e informada, autoriza a Metroceramicas, a
            que haga uso en cualquier forma de la base datos donde reposa su
            información, de acuerdo con lo señalado en esta política de
            privacidad.
          </p>
        </p>
        <p className="mb-5">
          <b>6- Derechos de los titulares</b>
          <p className="mb-5">
            Los Titulares de los Datos Personales registrados en las Bases de
            Datos de Metroceramica tendrán los derechos establecidos en la ley
            1581 de 2012, y ley 1266 de 2008, y en cualquier otra norma que las
            modifique, sustituya o complemente, en particular, pero sin
            limitarse al decreto 1377 de 2013, como los derechos al acceso,
            revocación, supresión, actualización, rectificación, corrección,
            cancelación y oposición de sus datos personales e información
            personal. El titular de la información personal, podrá
            facultativamente decidir si suministra o no información a
            Metroceramicas y que clase de información suministra, por lo demás,
            el titular será responsable por la veracidad, autenticidad y
            oportunidad de la información personal que suministre. Una vez
            suministrada o proporcionada la información personal, el titular
            autoriza expresamente a Metroceramicas, para la administración de la
            información.
          </p>
        </p>
        <p className="mb-5">
          <b>7- Procedimiento de consultas y reclamos</b>
          <p className="mb-5">
            De acuerdo a los artículos 14 y 15 de la ley 1581 de 2012, con el
            objetivo de garantizar la ejecución de tal derecho, las consultas
            y/o reclamos que el titular desee realizar, serán atendidas de
            manera presencial en nuestras instalaciones, ubicadas en la Autop.
            Norte Nº 138-83 en la ciudad de Bogotá. Las consultas o reclamos
            tendrán el siguiente tramite: Consultas: La consulta será atendida
            en un término máximo de diez (10) días hábiles contados a partir de
            la fecha de recibo de la misma. Cuando no fuere posible atender la
            consulta dentro de dicho termino, se informará al interesado,
            expresando los motivos de la demora y señalando la fecha en que se
            atenderá su consulta, la cual en ningún caso podrá superar los cinco
            (5) días hábiles siguientes al vencimiento del primer término.
            Reclamos: El titular que consideren que la información que posee
            Metroceramicas debe ser objeto de corrección, actualización o
            supresión, cuando adviertan el presunto incumplimiento de cualquiera
            de los deberes contenidos en las leyes aplicables, o cuando
            pretendan revocar la autorización otorgada por medio del presente
            documento, podrán presentar un reclamo ante Metroceramicas mediante
            solicitud escrita, con la identificación del usuario, su dirección,
            la descripción de los hechos que dan lugar al reclamo y los
            documentos que se quiera hacer valer. Si el reclamo resulta
            incompleto, se requerirá al interesado dentro de los cinco (5) días
            siguientes a la recepción del reclamo para que subsane las fallas.
            Transcurridos dos (2) meses desde la fecha del requerimiento, sin
            que el solicitante presente la información requerida, se entenderá
            que ha desistido del reclamo. En caso de que quien reciba el reclamo
            no sea competente para resolverlo, dará traslado a quien corresponda
            en un término máximo de dos (2) días hábiles e informara de la
            situación al interesado. El término máximo para atender el reclamo
            será de quince (15) días hábiles contados a partir del día siguiente
            a la fecha de su recibo. Cuando no fuere posible atender el reclamo
            dentro de dicho término, se informará al interesado los motivos de
            la demora y la fecha en que se atenderá su reclamo, la cual en
            ningún caso podrá superar los ocho (8) días hábiles siguientes al
            vencimiento del primer término. El interesado solo podrá elevar
            queja ante la superintendencia de industria y comercio una vez haya
            agotado el trámite de consulta o reclamo ante el responsable del
            tratamiento.
          </p>
        </p>
        <p className="mb-5">
          <b>8- Área encargada</b>
          <p className="mb-5">
            La recepción y atención de las consultas y los reclamos que el
            titular desee elevar ante Metroceramicas, estará a cargo del área de
            quejas y reclamos.
          </p>
        </p>
        <p className="mmb-5">
          <b>9- Vigencia</b>
          <p className="mb-5">
            La presente política de privacidad entra en vigencia a partir del
            día 15 de junio de 2018. Esta política podrá ser modificada en
            cualquier momento y de forma unilateral por parte de Metroceramicas.
          </p>
        </p>
      </Dialog>
    </div>
  );
};

export default Potradatos;
