"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  LegalList,
  LegalSection,
} from "@/features/legal/components/LegalDocumentPrimitives";

type Props = {
  accepted?: boolean;
  acceptLabel?: string;
  acceptedLabel?: string;
  hideActions?: boolean;
  onAccept?: () => void;
  onBack?: () => void;
  onReadStateChange?: (hasReachedEnd: boolean) => void;
  requireScrollToAccept?: boolean;
};

const nearBottomOffset = 24;

export function PrivacyPolicyPanel({
  accepted = false,
  acceptLabel = "Aceptar política",
  acceptedLabel = "Política aceptada",
  hideActions = false,
  onAccept,
  onBack,
  onReadStateChange,
  requireScrollToAccept = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onReadStateChangeRef = useRef(onReadStateChange);
  const [hasReachedEnd, setHasReachedEnd] = useState(!requireScrollToAccept);

  useEffect(() => {
    onReadStateChangeRef.current = onReadStateChange;
  }, [onReadStateChange]);

  useEffect(() => {
    if (!requireScrollToAccept) return;

    const node = containerRef.current;
    if (!node) return;

    const updateReadProgress = () => {
      const remaining = node.scrollHeight - node.scrollTop - node.clientHeight;
      setHasReachedEnd(remaining <= nearBottomOffset);
    };

    const rafId = window.requestAnimationFrame(updateReadProgress);
    window.addEventListener("resize", updateReadProgress);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateReadProgress);
    };
  }, [requireScrollToAccept]);

  useEffect(() => {
    onReadStateChangeRef.current?.(hasReachedEnd);
  }, [hasReachedEnd]);

  function handleScroll() {
    if (!requireScrollToAccept || hasReachedEnd) return;

    const node = containerRef.current;
    if (!node) return;

    const remaining = node.scrollHeight - node.scrollTop - node.clientHeight;
    if (remaining <= nearBottomOffset) {
      setHasReachedEnd(true);
    }
  }

  const acceptDisabled = accepted || (requireScrollToAccept && !hasReachedEnd);

  return (
    <section
      id="privacy-policy-panel"
      aria-labelledby="privacy-policy-title"
      {...(!hideActions ? { role: "dialog" as const } : {})}
      className="flex h-full min-h-0 flex-col"
    >
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 touch-pan-y [-webkit-overflow-scrolling:touch] sm:pr-2 md:pr-3"
      >
        <div className="border-b border-border-subtle pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-content-muted md:text-[11px]">
            GOKAI
          </p>
          <h2
            id="privacy-policy-title"
            className="mt-2 text-xl font-semibold tracking-tight text-content-primary md:text-2xl"
          >
            Política de Privacidad de GOKAI
          </h2>
          <p className="mt-1.5 text-xs leading-5 text-content-tertiary md:text-sm">
            <strong>Última actualización:</strong> 23 de junio de 2026
          </p>
          <p className="mt-3 max-w-3xl text-xs leading-6 text-content-secondary md:text-sm">
            Esta Política de Privacidad explica cómo <strong>GOKAI</strong>{" "}
            recopila, utiliza, comparte y protege datos personales cuando
            utilizas la Plataforma.
          </p>
          <p className="mt-2 max-w-3xl text-xs leading-6 text-content-secondary md:text-sm">
            Al usar la Plataforma, reconoces haber leído esta política. Si no
            estás de acuerdo, por favor no utilices la Plataforma.
          </p>
        </div>

        <div className="mt-4 space-y-4 pb-5 sm:mt-5 sm:pb-6">
          <LegalSection title="1. Identidad del responsable y contacto">
            <p>
              GOKAI y el personal de GOKAI autorizado para operar, administrar,
              dar soporte, facturar y proteger la Plataforma son responsables
              del tratamiento de los datos descritos en esta política.
            </p>
            <LegalList
              items={[
                <>
                  <strong>Nombre comercial:</strong> GOKAI
                </>,
                <>
                  <strong>Sitio o dominio:</strong> gokai.io y/o los dominios
                  oficiales utilizados por GOKAI
                </>,
                <>
                  <strong>Contacto:</strong> gokai.learn@gmail.com
                </>,
              ]}
            />
          </LegalSection>

          <LegalSection title="2. Alcance">
            <p>Esta política aplica al uso de la Plataforma, incluyendo:</p>
            <LegalList
              items={[
                <>Registro y gestión de tu cuenta.</>,
                <>
                  Uso de lecciones, ejercicios, estadísticas, reportes y
                  funciones de aprendizaje.
                </>,
                <>
                  Funciones basadas en IA, por ejemplo práctica conversacional,
                  recomendaciones y retroalimentación.
                </>,
                <>
                  Funciones de audio, por ejemplo reproducción de audios de
                  práctica y, cuando aplique, grabación o carga de audio para
                  retroalimentación.
                </>,
                <>Suscripciones, pagos y facturación, por ejemplo GOKAI+.</>,
              ]}
            />
          </LegalSection>

          <LegalSection title="3. Qué datos solicitamos y en qué momentos">
            <p>
              No todos los datos se solicitan al mismo tiempo. Los datos que
              tratamos dependen de la acción que realices dentro de la
              Plataforma y de las funciones que decidas usar.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-content-primary">
                  3.1. Para registrar y administrar una cuenta
                </h3>
                <p className="mt-2 text-sm leading-7 text-content-secondary">
                  Cuando creas una cuenta o inicias sesión, GOKAI puede
                  solicitar y tratar datos como:
                </p>
                <LegalList
                  items={[
                    <>
                      Nombre, apellidos, correo electrónico y fecha de
                      nacimiento.
                    </>,
                    <>
                      Contraseña, código de verificación y datos de
                      autenticación o sesión equivalentes.
                    </>,
                    <>
                      Información necesaria para validar edad, elegibilidad y,
                      cuando corresponda, autorización de madre, padre o tutor.
                    </>,
                  ]}
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-content-primary">
                  3.2. Para usar lecciones, repaso y funciones de aprendizaje
                </h3>
                <p className="mt-2 text-sm leading-7 text-content-secondary">
                  Cuando utilizas la Plataforma para estudiar, GOKAI puede
                  tratar datos como:
                </p>
                <LegalList
                  items={[
                    <>
                      Progreso, respuestas, historial de estudio, resultados,
                      precisión, rachas, repasos y otras métricas de
                      aprendizaje.
                    </>,
                    <>
                      Preferencias de configuración, accesibilidad, idioma, tema
                      visual y opciones similares.
                    </>,
                    <>
                      Interacciones dentro de la Plataforma, como secciones
                      visitadas, acciones realizadas y horarios aproximados de
                      uso.
                    </>,
                  ]}
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-content-primary">
                  3.3. Para soporte, contacto o comunicaciones
                </h3>
                <p className="mt-2 text-sm leading-7 text-content-secondary">
                  Si escribes a soporte, envías comentarios o haces una
                  solicitud, GOKAI puede tratar:
                </p>
                <LegalList
                  items={[
                    <>
                      Texto que proporciones en formularios, mensajes o correos.
                    </>,
                    <>
                      Datos relacionados con tu cuenta o con el problema que
                      reportes para atender la solicitud.
                    </>,
                  ]}
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-content-primary">
                  3.4. Para retroalimentación de pronunciación y funciones de
                  voz
                </h3>
                <p className="mt-2 text-sm leading-7 text-content-secondary">
                  Si utilizas funciones que requieren voz, como práctica de
                  pronunciación o análisis de audio:
                </p>
                <LegalList
                  items={[
                    <>
                      GOKAI puede solicitar acceso al micrófono de tu
                      dispositivo para capturar audio.
                    </>,
                    <>
                      El audio puede permanecer en tu dispositivo durante la
                      grabación y enviarse a nuestros servidores solo cuando
                      decidas compartirlo, subirlo o procesarlo.
                    </>,
                    <>
                      También puedes subir archivos de audio para su análisis.
                    </>,
                    <>
                      GOKAI puede generar y tratar datos derivados, por ejemplo
                      métricas acústicas, indicadores técnicos y resultados de
                      evaluación de pronunciación.
                    </>,
                  ]}
                />
                <p className="mt-2 text-sm leading-7 text-content-secondary">
                  Si no deseas que se trate audio, no utilices las funciones de
                  voz y revoca el permiso del micrófono desde tu dispositivo o
                  navegador.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-content-primary">
                  3.5. Para adquirir una suscripción o solicitar factura
                </h3>
                <p className="mt-2 text-sm leading-7 text-content-secondary">
                  Si contratas un plan de pago, por ejemplo GOKAI+, o si
                  solicitas factura, GOKAI puede tratar:
                </p>
                <LegalList
                  items={[
                    <>
                      Estado de suscripción, fechas de vigencia, identificadores
                      de compra y datos operativos asociados a la transacción.
                    </>,
                    <>
                      Datos de facturación que nos compartas para emitir la
                      factura cuando corresponda.
                    </>,
                    <>
                      Identificadores generados por el proveedor de pagos, como
                      Stripe u otros equivalentes.
                    </>,
                  ]}
                />
                <p className="mt-2 text-sm leading-7 text-content-secondary">
                  Por lo general, el proveedor de pago trata la información
                  financiera, por ejemplo la tarjeta, directamente y GOKAI no
                  almacena la información completa del medio de pago.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-content-primary">
                  3.6. Datos técnicos, cookies y almacenamiento local
                </h3>
                <p className="mt-2 text-sm leading-7 text-content-secondary">
                  Al navegar o usar la Plataforma, GOKAI puede tratar:
                </p>
                <LegalList
                  items={[
                    <>
                      Información del dispositivo y del navegador, por ejemplo
                      tipo de dispositivo, sistema operativo, idioma y datos de
                      conexión.
                    </>,
                    <>
                      Datos de registro o logs para seguridad, diagnóstico y
                      prevención de fraude.
                    </>,
                    <>
                      Cookies, tecnologías similares y almacenamiento local del
                      navegador para recordar preferencias o estados de uso.
                    </>,
                  ]}
                />
              </div>
            </div>
          </LegalSection>

          <LegalSection title="4. Finalidades del tratamiento">
            <p>GOKAI puede utilizar los datos para:</p>
            <LegalList
              items={[
                <>
                  <strong>Prestar el servicio:</strong> crear y administrar tu
                  cuenta, permitir acceso a funcionalidades y mantener la
                  Plataforma operativa.
                </>,
                <>
                  <strong>Personalización y aprendizaje:</strong> adaptar
                  lecciones, repaso, recomendaciones y retroalimentación según
                  tu progreso.
                </>,
                <>
                  <strong>Funciones de IA:</strong> generar sugerencias,
                  correcciones y retroalimentación automatizada.
                </>,
                <>
                  <strong>Pronunciación y audio:</strong> analizar audio para
                  brindar retroalimentación y habilitar funciones de voz.
                </>,
                <>
                  <strong>Pagos y suscripciones:</strong> gestionar altas,
                  renovaciones, cancelaciones, aclaraciones y estado de la
                  suscripción.
                </>,
                <>
                  <strong>Facturación:</strong> atender solicitudes y emitir
                  facturas cuando aplique.
                </>,
                <>
                  <strong>Seguridad:</strong> prevenir fraude o abuso, proteger
                  cuentas y detectar actividad sospechosa.
                </>,
                <>
                  <strong>Soporte:</strong> atender solicitudes, dudas y
                  reportes.
                </>,
                <>
                  <strong>Mejora del servicio:</strong> medir desempeño,
                  corregir errores y optimizar la experiencia.
                </>,
                <>
                  <strong>Cumplimiento:</strong> atender obligaciones legales y
                  requerimientos de autoridad.
                </>,
              ]}
            />
          </LegalSection>

          <LegalSection title="5. Bases para el tratamiento">
            <p>Según el caso, GOKAI trata datos con base en:</p>
            <LegalList
              items={[
                <>
                  <strong>Ejecución de una relación contractual</strong>, por
                  ejemplo para brindarte el servicio que solicitas.
                </>,
                <>
                  <strong>Consentimiento</strong>, por ejemplo cuando habilitas
                  y usas funciones de micrófono o audio.
                </>,
                <>
                  <strong>Interés legítimo</strong>, por ejemplo para seguridad,
                  prevención de fraude y mejora del servicio.
                </>,
                <>
                  <strong>Obligación legal</strong>, por ejemplo para atender
                  requerimientos de autoridad o conservar información cuando la
                  ley lo exige.
                </>,
              ]}
            />
          </LegalSection>

          <LegalSection title="6. Funciones de IA y decisiones automatizadas">
            <p>
              La Plataforma puede incluir funciones basadas en IA que generan
              retroalimentación y recomendaciones.
            </p>
            <LegalList
              items={[
                <>La IA puede cometer errores o ser imprecisa.</>,
                <>
                  La retroalimentación se ofrece como apoyo al aprendizaje y no
                  sustituye asesoría especializada.
                </>,
              ]}
            />

            <div className="mt-4">
              <h3 className="text-sm font-semibold text-content-primary">
                6.1. IA de pronunciación
              </h3>
              <p className="mt-2 text-sm leading-7 text-content-secondary">
                Cuando uses funciones de pronunciación, el audio puede ser
                procesado mediante técnicas de análisis de señal y modelos de
                aprendizaje automático. En algunos casos, el audio puede
                enviarse al servidor para su análisis.
              </p>
              <p className="mt-2 text-sm leading-7 text-content-secondary">
                GOKAI puede tratar el audio de forma transitoria para generar la
                retroalimentación. Si en el futuro se ofrecen opciones para
                guardar historial de audios o mejorar modelos con datos del
                Usuario, se solicitará el consentimiento correspondiente cuando
                aplique y se explicarán los controles disponibles.
              </p>
            </div>
          </LegalSection>

          <LegalSection title="7. Cookies y almacenamiento local">
            <p>
              GOKAI puede usar cookies, almacenamiento local u otras tecnologías
              similares para:
            </p>
            <LegalList
              items={[
                <>Mantener tu sesión activa.</>,
                <>
                  Recordar preferencias, por ejemplo tema visual, accesibilidad,
                  confirmaciones y configuraciones similares.
                </>,
                <>
                  Recordar estados de uso, por ejemplo avances o selecciones.
                </>,
              ]}
            />
            <p>
              Puedes administrar cookies desde la configuración de tu navegador.
              Deshabilitar ciertas cookies o almacenamiento puede afectar el
              funcionamiento de la Plataforma.
            </p>
          </LegalSection>

          <LegalSection title="8. Compartición de datos con terceros">
            <p>GOKAI puede compartir datos con:</p>
            <LegalList
              items={[
                <>
                  <strong>Proveedores de servicios</strong> que ayudan a operar
                  la Plataforma, por ejemplo hosting, almacenamiento, correo,
                  soporte, monitoreo, infraestructura o seguridad.
                </>,
                <>
                  <strong>Proveedores de pago</strong>, por ejemplo Stripe u
                  otros, para procesar suscripciones y transacciones.
                </>,
                <>
                  <strong>Autoridades</strong> cuando exista obligación legal o
                  requerimiento válido.
                </>,
              ]}
            />
            <p>
              En todos los casos, GOKAI procura que los terceros traten datos
              únicamente para las finalidades autorizadas y con medidas de
              seguridad razonables.
            </p>
          </LegalSection>

          <LegalSection title="9. Transferencias internacionales">
            <p>
              Es posible que algunos proveedores o infraestructuras estén
              ubicados fuera de tu país. En ese caso, GOKAI puede transferir o
              permitir el acceso a datos desde otras jurisdicciones, aplicando
              salvaguardas razonables y, cuando corresponda, bases legales
              apropiadas.
            </p>
          </LegalSection>

          <LegalSection title="10. Conservación de los datos">
            <p>
              GOKAI conserva los datos durante el tiempo necesario para cumplir
              con las finalidades descritas, incluyendo:
            </p>
            <LegalList
              items={[
                <>Mientras mantengas una cuenta activa.</>,
                <>
                  Durante el tiempo necesario para gestionar suscripciones,
                  disputas, cumplimiento legal y seguridad.
                </>,
              ]}
            />
            <p>
              Cuando los datos ya no sean necesarios, GOKAI los eliminará o
              anonimizará conforme a prácticas razonables, salvo que exista una
              obligación legal de conservación.
            </p>
          </LegalSection>

          <LegalSection title="11. Seguridad">
            <p>
              GOKAI implementa medidas técnicas y organizativas razonables para
              proteger los datos contra acceso no autorizado, pérdida, uso
              indebido o alteración.
            </p>
            <p>
              Sin embargo, ningún sistema es 100% seguro. Te recomendamos usar
              contraseñas robustas, no compartir tus credenciales y proteger tu
              dispositivo.
            </p>
          </LegalSection>

          <LegalSection title="12. Tus derechos y opciones">
            <p>
              Dependiendo de tu jurisdicción y del tipo de datos, puedes
              solicitar:
            </p>
            <LegalList
              items={[
                <>Acceso a tus datos.</>,
                <>Rectificación o actualización.</>,
                <>Cancelación o eliminación cuando proceda.</>,
                <>Oposición o limitación del tratamiento en ciertos casos.</>,
                <>Portabilidad en ciertos supuestos.</>,
              ]}
            />
            <p className="mt-2">
              También puedes cambiar preferencias dentro de la Plataforma cuando
              existan ajustes disponibles y revocar permisos del micrófono desde
              tu dispositivo o navegador.
            </p>
            <p className="mt-2">
              Para ejercer derechos, contáctanos en{" "}
              <strong>gokai.learn@gmail.com</strong>.
            </p>
          </LegalSection>

          <LegalSection title="13. Privacidad de menores">
            <p>
              La Plataforma no está dirigida a menores de{" "}
              <strong>13 años</strong>.
            </p>
            <p>
              Si el Usuario es adolescente o menor de edad conforme a la
              legislación aplicable, el registro y uso de la cuenta debe contar
              con autorización válida de su madre, padre o tutor legal.
            </p>
            <p>
              GOKAI puede solicitar confirmaciones adicionales, limitar
              funcionalidades, rechazar registros o cerrar cuentas cuando
              detecte inconsistencias en la edad declarada o falta de
              autorización suficiente.
            </p>
            <p>
              Si eres madre, padre o tutor y crees que un menor proporcionó
              datos personales sin autorización adecuada, contáctanos para tomar
              medidas razonables.
            </p>
          </LegalSection>

          <LegalSection title="14. Enlaces y servicios de terceros">
            <p>
              La Plataforma puede incluir enlaces a servicios de terceros, por
              ejemplo redes sociales o proveedores de pago. Sus prácticas de
              privacidad se rigen por sus propias políticas y te recomendamos
              revisarlas.
            </p>
          </LegalSection>

          <LegalSection title="15. Cambios a esta política">
            <p>
              GOKAI puede actualizar esta política por razones operativas,
              legales o de mejora del servicio. Publicaremos la versión vigente
              con su fecha de actualización.
            </p>
            <p>
              Si el cambio es material, procuraremos notificarlo por medios
              razonables.
            </p>
          </LegalSection>

          <LegalSection title="16. Contacto">
            <p>Para dudas o solicitudes relacionadas con privacidad:</p>
            <LegalList items={[<>gokai.learn@gmail.com</>]} />
          </LegalSection>
        </div>
      </div>

      {!hideActions && (
        <div className="mt-3 shrink-0 border-t border-border-subtle pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 sm:mt-4 sm:pb-0 sm:pt-4">
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            {!accepted && acceptDisabled && (
              <p className="text-xs leading-5 text-content-tertiary sm:mr-auto sm:self-center">
                Desplázate hasta el final para habilitar la aceptación de la
                política.
              </p>
            )}
            <button
              type="button"
              onClick={onBack}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border-default bg-surface-primary px-4 py-2.5 text-sm font-semibold text-content-secondary transition hover:border-accent/30 hover:text-content-primary focus:outline-none focus:ring-4 focus:ring-red-100"
            >
              Regresar
            </button>
            <motion.button
              type="button"
              onClick={onAccept}
              disabled={acceptDisabled}
              whileHover={{ scale: acceptDisabled ? 1 : 1.01 }}
              whileTap={{ scale: acceptDisabled ? 1 : 0.99 }}
              className={[
                "inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-4",
                accepted
                  ? "bg-emerald-600 text-content-inverted focus:ring-emerald-200 disabled:hover:bg-emerald-600"
                  : "bg-accent text-content-inverted hover:bg-accent-hover focus:ring-red-200 disabled:hover:bg-accent",
                "disabled:cursor-not-allowed disabled:opacity-60",
              ].join(" ")}
            >
              {accepted ? acceptedLabel : acceptLabel}
            </motion.button>
          </div>
        </div>
      )}
    </section>
  );
}
