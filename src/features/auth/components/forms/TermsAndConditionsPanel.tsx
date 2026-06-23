"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  LegalList,
  LegalSection,
} from "@/features/legal/components/LegalDocumentPrimitives";

type Props = {
  accepted?: boolean;
  acceptedLabel?: string;
  hideActions?: boolean;
  onAccept?: () => void;
  onBack?: () => void;
  onReadStateChange?: (hasReachedEnd: boolean) => void;
  onRequestPrivacy?: () => void;
  acceptLabel?: string;
  requireScrollToAccept?: boolean;
};

const nearBottomOffset = 24;

export function TermsAndConditionsPanel({
  accepted = false,
  acceptedLabel = "Términos aceptados",
  onBack,
  onAccept,
  hideActions = false,
  onReadStateChange,
  onRequestPrivacy,
  acceptLabel = "Aceptar términos",
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
      id="register-terms-panel"
      aria-labelledby="terms-title"
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
            id="terms-title"
            className="mt-2 text-xl font-semibold tracking-tight text-content-primary md:text-2xl"
          >
            Términos y Condiciones de GOKAI
          </h2>
          <p className="mt-1.5 text-xs leading-5 text-content-tertiary md:text-sm">
            <strong>Última actualización:</strong> 23 de junio de 2026
          </p>
          <p className="mt-3 max-w-3xl text-xs leading-6 text-content-secondary md:text-sm">
            Estos Términos y Condiciones (en adelante, los{" "}
            <strong>“Términos”</strong>) regulan el acceso y uso de la
            plataforma <strong>GOKAI</strong> (en adelante, la{" "}
            <strong>“Plataforma”</strong>), incluyendo su sitio web,
            aplicaciones, funcionalidades y servicios asociados.
          </p>
          <p className="mt-2 max-w-3xl text-xs leading-6 text-content-secondary md:text-sm">
            Al acceder, registrarte o usar la Plataforma, aceptas quedar
            obligado por estos Términos. Si no estás de acuerdo, no uses la
            Plataforma.
          </p>
        </div>

        <div className="mt-4 space-y-4 pb-5 sm:mt-5 sm:pb-6">
          <LegalSection title="1. Identidad y contacto">
            <p>
              La Plataforma es operada por <strong>GOKAI</strong> y por el
              personal de GOKAI responsable de su administración, soporte,
              moderación, facturación y prestación del servicio.
            </p>
            <LegalList
              items={[
                <>
                  <strong>Nombre comercial:</strong> GOKAI
                </>,
                <>
                  <strong>Sitio/dominio:</strong> gokai.io y/o los dominios
                  oficiales utilizados por GOKAI
                </>,
                <>
                  <strong>Correo de contacto:</strong> gokai.learn@gmail.com
                </>,
              ]}
            />
            <p>
              Cuando estos Términos hagan referencia a <strong>GOKAI</strong> o
              al <strong>personal de GOKAI</strong>, se entiende que se trata de
              las personas autorizadas para operar y proteger la Plataforma.
            </p>
          </LegalSection>

          <LegalSection title="2. Definiciones">
            <p>Para efectos de estos Términos:</p>
            <LegalList
              items={[
                <>
                  <strong>“Usuario”</strong>: persona que accede o utiliza la
                  Plataforma.
                </>,
                <>
                  <strong>“Cuenta”</strong>: registro asociado a un Usuario para
                  acceder a funcionalidades.
                </>,
                <>
                  <strong>“Contenido”</strong>: materiales disponibles en la
                  Plataforma, incluyendo lecciones, ejercicios, estadísticas,
                  recursos visuales y materiales didácticos.
                </>,
                <>
                  <strong>“Contenido del Usuario”</strong>: información o
                  materiales que el Usuario proporciona o genera al usar la
                  Plataforma, como respuestas, configuraciones, texto o audio.
                </>,
                <>
                  <strong>“Servicios de IA”</strong>: funciones que usan
                  sistemas automatizados para generar recomendaciones,
                  conversación, análisis o retroalimentación.
                </>,
                <>
                  <strong>“IA de pronunciación”</strong>: funcionalidad que
                  analiza audio de la voz del Usuario para evaluar pronunciación
                  y dar retroalimentación.
                </>,
                <>
                  <strong>“Métricas de aprendizaje”</strong>: indicadores de uso
                  y progreso, como lecciones completadas, precisión, repasos,
                  rachas, tiempo de estudio y avance por tema.
                </>,
                <>
                  <strong>“GOKAI+”</strong>: plan de suscripción de pago con
                  funciones adicionales o cualquier denominación equivalente
                  mostrada en la Plataforma.
                </>,
              ]}
            />
          </LegalSection>

          <LegalSection title="3. Descripción general del servicio">
            <p>
              GOKAI es una Plataforma enfocada en el aprendizaje de japonés, que
              incluye funcionalidades como:
            </p>
            <LegalList
              items={[
                <>Lecciones y ejercicios.</>,
                <>Repasos inteligentes y seguimiento del progreso.</>,
                <>Estadísticas y reportes.</>,
                <>
                  Funciones basadas en IA, como práctica conversacional y
                  recomendaciones.
                </>,
                <>Recursos visuales para escritura y trazos.</>,
                <>
                  IA de pronunciación para retroalimentación automática basada
                  en audio.
                </>,
              ]}
            />
            <p>
              Las estadísticas y reportes pueden mostrarse por sesión, por
              periodos semanales o mensuales, o con otra periodicidad informada
              en la función correspondiente. Entre otras, las métricas pueden
              incluir progreso por tema, lecciones completadas, repasos
              realizados, precisión en ejercicios, rachas y tiempo de estudio.
            </p>
            <p>
              La disponibilidad de funciones puede variar según el plan, la
              región, el dispositivo, la edad declarada, la compatibilidad
              técnica, la fase de desarrollo y el estado de cumplimiento de la
              Cuenta.
            </p>
          </LegalSection>

          <LegalSection title="4. Requisitos de uso y elegibilidad">
            <p>Al usar la Plataforma declaras que:</p>
            <LegalList
              items={[
                <>Tienes capacidad legal para aceptar estos Términos.</>,
                <>
                  Has leído y aceptas estos Términos y la Política de Privacidad
                  aplicable.
                </>,
                <>
                  Si eres menor de edad, usas la Plataforma con autorización y
                  supervisión de tu madre, padre o tutor legal, conforme a la
                  legislación aplicable.
                </>,
              ]}
            />
            <p>La Plataforma no está dirigida a menores de 13 años.</p>
            <p>
              GOKAI puede restringir el uso a ciertos rangos de edad, requerir
              verificaciones, solicitar confirmaciones adicionales durante el
              registro o cerrar cuentas cuando no exista autorización válida
              para menores de edad.
            </p>
          </LegalSection>

          <LegalSection title="5. Registro de cuenta y seguridad">
            <p>
              Para acceder a ciertas funciones, podrías necesitar crear una
              Cuenta.
            </p>
            <p>
              El acceso a funcionalidades puede depender del tipo de cuenta,
              plan activo, verificación de correo, edad declarada, región,
              dispositivo, compatibilidad técnica, disponibilidad beta y
              cumplimiento de estos Términos.
            </p>
            <LegalList
              items={[
                <>
                  Eres responsable de la veracidad y actualización de la
                  información de tu Cuenta.
                </>,
                <>
                  Tu Cuenta es personal e individual; no debes compartirla ni
                  permitir su uso por múltiples personas.
                </>,
                <>
                  Debes mantener la confidencialidad de tus credenciales y
                  notificar de inmediato cualquier uso no autorizado,
                  vulneración o sospecha de compromiso.
                </>,
                <>
                  El personal de GOKAI se reserva el derecho a suspender o
                  eliminar cuentas si se detecta un uso indebido.
                </>,
              ]}
            />
            <p>
              GOKAI se reserva el derecho a suspender cuentas por uso indebido,
              incluido el mal uso de credenciales de acceso. Para evaluar
              posibles incumplimientos y resolver reclamos de seguridad, GOKAI
              podrá revisar registros de acceso, actividad simultánea inusual,
              dispositivos, sesiones, bitácoras operativas y demás evidencia
              técnica necesaria, conforme a la Política de Privacidad.
            </p>
          </LegalSection>

          <LegalSection title="6. Planes, suscripciones y pagos">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-content-primary">
                  6.1. Plan gratuito y plan de pago
                </h4>
                <p className="mt-2">
                  La Plataforma puede ofrecer un plan gratuito con funciones
                  limitadas y un plan de pago (<strong>GOKAI+</strong>) con
                  funciones ampliadas.
                </p>
                <p>
                  Las características incluidas en cada plan, precios, moneda,
                  periodos de facturación y promociones se muestran en la
                  Plataforma al momento de la compra.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-content-primary">
                  6.2. Facturación recurrente
                </h4>
                <p className="mt-2">
                  Si contratas una suscripción, autorizas el cobro recurrente
                  conforme al periodo contratado. La suscripción se renovará
                  automáticamente hasta que la canceles.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-content-primary">
                  6.3. Procesamiento de pagos
                </h4>
                <p className="mt-2">
                  Los pagos son procesados por proveedores de pago de terceros,
                  por ejemplo Stripe u otros. En ese caso:
                </p>
                <LegalList
                  items={[
                    <>
                      El proveedor puede requerir información adicional y
                      aplicar sus propios términos y políticas.
                    </>,
                    <>
                      GOKAI no almacena necesariamente la información completa
                      de tu tarjeta, según el flujo del proveedor.
                    </>,
                  ]}
                />
              </div>

              <div>
                <h4 className="text-sm font-semibold text-content-primary">
                  6.4. Cupones y promociones
                </h4>
                <p className="mt-2">
                  Si la Plataforma ofrece cupones o promociones:
                </p>
                <LegalList
                  items={[
                    <>
                      Estarán sujetos a condiciones específicas, como vigencia,
                      elegibilidad o no acumulación.
                    </>,
                    <>
                      GOKAI puede invalidar cupones en caso de abuso, fraude o
                      uso contrario a sus reglas.
                    </>,
                  ]}
                />
              </div>

              <div>
                <h4 className="text-sm font-semibold text-content-primary">
                  6.5. Cancelación
                </h4>
                <p className="mt-2">
                  Puedes cancelar tu suscripción en cualquier momento desde las
                  opciones disponibles en la Plataforma.
                </p>
                <p>Salvo que se indique lo contrario, la cancelación:</p>
                <LegalList
                  items={[
                    <>
                      Detiene la <strong>renovación automática</strong>.
                    </>,
                    <>
                      Mantiene el acceso a funciones de pago{" "}
                      <strong>
                        hasta el final del periodo de facturación vigente
                      </strong>
                      .
                    </>,
                  ]}
                />
              </div>

              <div>
                <h4 className="text-sm font-semibold text-content-primary">
                  6.6. Reembolsos
                </h4>
                <p className="mt-2">
                  Salvo obligación legal o indicación expresa en la Plataforma,
                  los cargos de suscripción no son reembolsables y no se otorgan
                  reembolsos prorrateados por periodos parcialmente utilizados.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-content-primary">
                  6.7. Facturación
                </h4>
                <p className="mt-2">
                  Si requieres factura por tu suscripción a{" "}
                  <strong>GOKAI+</strong>, deberás solicitarla al correo{" "}
                  <strong>gokai.learn@gmail.com</strong>.
                </p>
                <p>
                  GOKAI podrá solicitar la información fiscal necesaria y
                  emitirá la factura por medio de la entidad o persona
                  habilitada por GOKAI para ese fin al momento de la solicitud.
                </p>
              </div>
            </div>
          </LegalSection>

          <LegalSection title="7. Uso permitido, cuenta personal y código de conducta">
            <p>
              El Usuario se compromete a utilizar la Plataforma de forma lícita,
              personal y conforme a estos Términos.
            </p>
            <p>Se consideran conductas indebidas, entre otras:</p>
            <LegalList
              items={[
                <>
                  Usar la Plataforma para actividades ilegales o que vulneren
                  derechos de terceros.
                </>,
                <>
                  Interferir con el funcionamiento de la Plataforma, por ejemplo
                  mediante ataques, scraping abusivo, ingeniería inversa no
                  permitida o elusión de medidas técnicas.
                </>,
                <>
                  Compartir, revender o prestar accesos, o permitir el uso de tu
                  Cuenta por terceros de manera no autorizada.
                </>,
                <>
                  Suplantar identidades, incurrir en fraude, acosar, amenazar,
                  discriminar o afectar la experiencia de otros usuarios.
                </>,
                <>
                  Subir, enviar o procesar contenido difamatorio, ilícito, que
                  infrinja propiedad intelectual o que invada la privacidad de
                  terceros.
                </>,
                <>
                  Hacer mal uso de credenciales, automatizaciones o
                  integraciones no autorizadas.
                </>,
              ]}
            />
            <p>
              Como medidas de cumplimiento, GOKAI podrá aplicar advertencias,
              limitaciones funcionales, suspensión temporal o cancelación
              definitiva de la Cuenta, según la gravedad, recurrencia y
              evidencia disponible.
            </p>
          </LegalSection>

          <LegalSection title="8. Propiedad intelectual">
            <p>
              Salvo que se indique lo contrario, la Plataforma, incluyendo
              diseño, marca, textos, organización, funcionalidades y materiales,
              pertenece a GOKAI o cuenta con licencias para su uso.
            </p>
            <p>
              El Usuario obtiene una licencia personal, limitada, no exclusiva,
              no transferible y revocable para usar la Plataforma únicamente
              para fines personales y conforme a estos Términos.
            </p>
          </LegalSection>

          <LegalSection title="9. Contenido del Usuario">
            <p>
              El Usuario conserva los derechos que correspondan sobre su
              Contenido del Usuario.
            </p>
            <p>
              Sin embargo, al subir o generar Contenido del Usuario en la
              Plataforma, otorgas a GOKAI una licencia mundial, no exclusiva,
              libre de regalías y limitada a:
            </p>
            <LegalList
              items={[
                <>operar la Plataforma;</>,
                <>
                  almacenar y procesar el Contenido del Usuario para prestar el
                  servicio;
                </>,
                <>
                  generar retroalimentación, métricas, reportes de progreso y
                  recomendaciones;
                </>,
                <>mantener copias de seguridad y prevenir fraude o abuso.</>,
              ]}
            />
            <p>
              El Usuario declara y garantiza que cuenta con los derechos y
              autorizaciones necesarias para proporcionar dicho contenido,
              incluyendo, cuando aplique, la voz de terceros.
            </p>
          </LegalSection>

          <LegalSection title="10. Funciones de IA">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-content-primary">
                  10.1. Naturaleza del servicio de IA
                </h4>
                <p className="mt-2">
                  Algunas funciones de la Plataforma usan sistemas automatizados
                  que pueden generar respuestas, sugerencias, correcciones o
                  retroalimentación.
                </p>
                <p>Estas funciones:</p>
                <LegalList
                  items={[
                    <>pueden contener errores o imprecisiones;</>,
                    <>
                      no sustituyen asesoría profesional, educativa
                      especializada, médica, legal u otra;
                    </>,
                    <>
                      se proporcionan como apoyo al aprendizaje y la práctica.
                    </>,
                  ]}
                />
              </div>

              <div>
                <h4 className="text-sm font-semibold text-content-primary">
                  10.2. IA de pronunciación
                </h4>
                <p className="mt-2">
                  La Plataforma puede permitirte grabar o subir audio para
                  analizar tu pronunciación. Al usar esta función:
                </p>
                <LegalList
                  items={[
                    <>
                      autorizas el procesamiento automatizado del audio con
                      fines de evaluación y retroalimentación;
                    </>,
                    <>
                      reconoces que los resultados son estimaciones y pueden
                      variar según ruido, micrófono, acento, velocidad del habla
                      y otros factores;
                    </>,
                    <>
                      te comprometes a no subir audio que infrinja derechos de
                      terceros o que contenga información sensible de otras
                      personas sin su consentimiento.
                    </>,
                  ]}
                />
                <p>
                  GOKAI podrá ajustar la precisión, los umbrales de evaluación y
                  los métodos de análisis conforme evolucione la funcionalidad.
                </p>
              </div>
            </div>
          </LegalSection>

          <LegalSection title="11. Privacidad y tratamiento de datos">
            <p>
              El uso de la Plataforma también está sujeto a la{" "}
              {onRequestPrivacy ? (
                <button
                  type="button"
                  onClick={onRequestPrivacy}
                  className="font-semibold text-accent underline decoration-accent/40 underline-offset-3 transition hover:text-accent-hover"
                >
                  Política de Privacidad
                </button>
              ) : (
                <Link
                  href="/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-accent underline decoration-accent/40 underline-offset-3 transition hover:text-accent-hover"
                >
                  Política de Privacidad
                </Link>
              )}
              , la cual forma parte complementaria de estos Términos y describe
              el tratamiento de datos personales, audio y métricas de
              aprendizaje.
            </p>
            <p>
              GOKAI tratará los datos del Usuario conforme a la legislación
              aplicable y a prácticas razonables de seguridad, minimización y
              resolución de incidentes.
            </p>
          </LegalSection>

          <LegalSection title="12. Disponibilidad del servicio y cambios">
            <p>
              GOKAI se esfuerza por mantener la Plataforma disponible, pero no
              garantiza acceso ininterrumpido. Podrían presentarse
              interrupciones por mantenimiento, mejoras, incidencias o causas
              ajenas a nuestro control.
            </p>
            <p>
              GOKAI puede modificar, actualizar o descontinuar funcionalidades
              total o parcialmente. Cuando el cambio afecte de forma material a
              una suscripción activa, GOKAI procurará informar por medios
              razonables.
            </p>
            <p>
              El Usuario es responsable de instalar las actualizaciones
              disponibles y utilizar la versión más reciente del software o de
              las aplicaciones compatibles cuando ello sea necesario para
              seguridad, estabilidad o acceso a funciones.
            </p>
          </LegalSection>

          <LegalSection title="13. Enlaces y servicios de terceros">
            <p>
              La Plataforma puede incluir enlaces o integraciones de terceros,
              por ejemplo procesadores de pago, redes sociales u otros. El uso
              de dichos servicios queda sujeto a los términos y políticas de
              esos terceros.
            </p>
            <p>
              GOKAI no es responsable por el contenido, disponibilidad o
              prácticas de terceros ajenos.
            </p>
          </LegalSection>

          <LegalSection title="14. Suspensión y terminación">
            <p>
              GOKAI puede suspender o terminar el acceso a la Plataforma, con o
              sin aviso, si:
            </p>
            <LegalList
              items={[
                <>el Usuario incumple estos Términos;</>,
                <>
                  existe sospecha razonable de fraude, abuso o riesgo de
                  seguridad;
                </>,
                <>lo exige la ley o una autoridad competente.</>,
              ]}
            />
            <p>
              El Usuario puede dejar de usar la Plataforma en cualquier momento.
              Si existe suscripción activa, debe cancelarla para evitar
              renovaciones.
            </p>
          </LegalSection>

          <LegalSection title="15. Resultados de aprendizaje y exclusión de garantías">
            <p>
              Los resultados de aprendizaje dependen de la constancia del
              Usuario, su nivel previo, el tiempo de estudio, la calidad del
              repaso, la práctica fuera de la Plataforma y otros factores
              personales.
            </p>
            <p>
              GOKAI es un complemento para el aprendizaje y la práctica del
              japonés; no sustituye clases, tutores ni otros medios formales de
              aprendizaje.
            </p>
            <p>
              De forma orientativa, algunas personas pueden empezar a observar
              tendencias de progreso dentro de las primeras 2 a 8 semanas de uso
              constante. Dichas tendencias pueden reflejarse en métricas como
              lecciones completadas, precisión, frecuencia de repaso, rachas y
              tiempo de estudio, pero no constituyen una garantía de resultado.
            </p>
            <p>
              En la medida permitida por la ley, la Plataforma se proporciona
              “tal cual” y “según disponibilidad”, sin garantías de ningún tipo,
              ya sean expresas o implícitas.
            </p>
            <p>GOKAI no garantiza que:</p>
            <LegalList
              items={[
                <>el servicio sea ininterrumpido o libre de errores;</>,
                <>
                  los resultados de aprendizaje cumplan expectativas
                  particulares;
                </>,
                <>
                  la retroalimentación de IA sea siempre exacta o adecuada para
                  todos los casos.
                </>,
              ]}
            />
          </LegalSection>

          <LegalSection title="16. Limitación de responsabilidad">
            <p>
              En la medida permitida por la legislación aplicable, GOKAI no será
              responsable por daños indirectos, incidentales, especiales,
              consecuenciales o punitivos, ni por pérdida de datos, pérdida de
              ingresos o interrupción del negocio, derivados del uso o
              imposibilidad de uso de la Plataforma.
            </p>
            <p>
              Si por disposición legal existiera responsabilidad, esta se
              limitará al monto efectivamente pagado por el Usuario a GOKAI por
              la suscripción en el periodo inmediatamente anterior al hecho que
              dio origen al reclamo, o al mínimo permitido por ley.
            </p>
          </LegalSection>

          <LegalSection title="17. Indemnización">
            <p>
              El Usuario se obliga a indemnizar y mantener en paz y a salvo a
              GOKAI ante reclamaciones de terceros derivadas de:
            </p>
            <LegalList
              items={[
                <>el uso indebido de la Plataforma;</>,
                <>el incumplimiento de estos Términos;</>,
                <>
                  el Contenido del Usuario que infrinja derechos de terceros.
                </>,
              ]}
            />
          </LegalSection>

          <LegalSection title="18. Modificaciones de estos Términos">
            <p>
              GOKAI puede actualizar estos Términos cuando sea necesario. La
              fecha de <strong>“Última actualización”</strong> indicará el
              momento del cambio.
            </p>
            <p>
              Si continúas usando la Plataforma después de la publicación de
              cambios, se entenderá que aceptas los Términos actualizados. Si no
              estás de acuerdo, debes dejar de usar la Plataforma y, en su caso,
              cancelar tu suscripción.
            </p>
          </LegalSection>

          <LegalSection title="19. Ley aplicable y jurisdicción">
            <p>
              Estos Términos se regirán por las leyes de <strong>México</strong>
              .
            </p>
            <p>
              Salvo que la normativa aplicable disponga otra cosa, cualquier
              controversia relacionada con estos Términos se someterá a la
              jurisdicción de los tribunales competentes de{" "}
              <strong>Jalisco</strong>.
            </p>
          </LegalSection>

          <LegalSection title="20. Contacto">
            <p>
              Para dudas, comentarios, solicitudes de factura o temas
              relacionados con estos Términos, puedes contactar a GOKAI en:
            </p>
            <LegalList items={[<>gokai.learn@gmail.com</>]} />
          </LegalSection>
        </div>
      </div>

      {!hideActions && (
        <div className="mt-3 shrink-0 border-t border-border-subtle pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 sm:mt-4 sm:pb-0 sm:pt-4">
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            {!accepted && acceptDisabled && (
              <p className="text-xs leading-5 text-content-tertiary sm:mr-auto sm:self-center">
                Desplázate hasta el final para habilitar la aceptación de los
                términos.
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
