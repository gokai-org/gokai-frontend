"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

type Props = {
  onBack: () => void;
  onAccept: () => void;
};

function TermsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border-default bg-surface-secondary/70 p-5 md:p-6">
      <h3 className="text-base font-semibold text-content-primary md:text-lg">
        {title}
      </h3>
      <div className="mt-3 space-y-3 text-sm leading-7 text-content-secondary">
        {children}
      </div>
    </section>
  );
}

function TermsList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2 pl-5 text-sm leading-7 text-content-secondary list-disc marker:text-accent/70">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export function TermsAndConditionsPanel({ onBack, onAccept }: Props) {
  return (
    <motion.section
      id="register-terms-panel"
      key="register-terms-panel"
      role="dialog"
      aria-labelledby="terms-title"
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 18, scale: 0.98 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] min-h-0 overflow-y-auto overscroll-contain pr-1 sm:h-auto sm:max-h-[78dvh] sm:min-h-[min(70dvh,760px)] md:pr-3"
    >
      <div className="border-b border-border-subtle pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-content-muted md:text-[11px]">
          GOKAI
        </p>
        <h2 id="terms-title" className="mt-2 text-xl font-semibold tracking-tight text-content-primary md:text-2xl">
          Términos y Condiciones de GOKAI
        </h2>
        <p className="mt-1.5 text-xs leading-5 text-content-tertiary md:text-sm">
          <strong>Última actualización:</strong> 10 de mayo de 2026
        </p>
        <p className="mt-3 max-w-3xl text-xs leading-6 text-content-secondary md:text-sm">
          Estos Términos y Condiciones (en adelante, los <strong>“Términos”</strong>) regulan el acceso y uso de la plataforma <strong>GOKAI</strong> (en adelante, la <strong>“Plataforma”</strong>), incluyendo su sitio web, aplicaciones, funcionalidades y servicios asociados.
        </p>
        <p className="mt-2 max-w-3xl text-xs leading-6 text-content-secondary md:text-sm">
          Al acceder, registrarte o usar la Plataforma, aceptas quedar obligado por estos Términos. Si no estás de acuerdo, no uses la Plataforma.
        </p>
      </div>

      <div className="mt-4 space-y-4 sm:mt-5">
        <TermsSection title="1. Identidad del titular y contacto">
          <p>
            La Plataforma es operada por el <strong>Titular</strong> (persona física o moral responsable de la prestación del servicio). En este caso, el Titular es una <strong>persona física</strong>.
          </p>
          <TermsList
            items={[
              <>
                <strong>Nombre comercial:</strong> GOKAI
              </>,
              <>
                <strong>Sitio/dominio:</strong> gokai.io y/o los dominios oficiales utilizados por GOKAI
              </>,
              <>
                <strong>Correo de contacto:</strong> gokai.learn@gmail.com
              </>,
            ]}
          />
          <p className="pt-1 font-medium text-content-primary"><strong>Datos del Titular (para publicación):</strong></p>
          <TermsList
            items={[
              <>
                <strong>Nombre completo del Titular (persona física):</strong> Samuel Reveles Pedraza
              </>,
              <>
                <strong>País:</strong> México
              </>,
            ]}
          />
        </TermsSection>

        <TermsSection title="2. Definiciones">
          <p>Para efectos de estos Términos:</p>
          <TermsList
            items={[
              <><strong>“Usuario”</strong>: persona que accede o utiliza la Plataforma.</>,
              <><strong>“Cuenta”</strong>: registro asociado a un Usuario para acceder a funcionalidades.</>,
              <><strong>“Contenido”</strong>: materiales disponibles en la Plataforma (por ejemplo, lecciones, ejercicios, explicaciones, estadísticas, recursos visuales y materiales didácticos).</>,
              <><strong>“Contenido del Usuario”</strong>: información o materiales que el Usuario proporciona o genera al usar la Plataforma (por ejemplo, texto, respuestas, configuraciones, audio de práctica, etc.).</>,
              <><strong>“Servicios de IA”</strong>: funciones que usan sistemas automatizados para generar recomendaciones, conversación, análisis o retroalimentación.</>,
              <><strong>“IA de pronunciación”</strong>: funcionalidad que analiza audio de la voz del Usuario para evaluar pronunciación y dar retroalimentación (p. ej., si una palabra fue pronunciada correctamente).</>,
              <><strong>“GOKAI+”</strong>: plan de suscripción de pago con funciones adicionales (o cualquier denominación equivalente mostrada en la Plataforma).</>,
            ]}
          />
        </TermsSection>

        <TermsSection title="3. Descripción general del servicio">
          <p>GOKAI es una Plataforma enfocada en el aprendizaje de japonés, que incluye funcionalidades como:</p>
          <TermsList
            items={[
              <>Lecciones y ejercicios.</>,
              <>Repasos inteligentes y seguimiento del progreso.</>,
              <>Estadísticas y reportes.</>,
              <>Funciones basadas en IA (por ejemplo, práctica conversacional y recomendaciones).</>,
              <>Recursos visuales para escritura y trazos.</>,
              <>IA de pronunciación, para retroalimentación automática basada en audio.</>,
            ]}
          />
          <p>
            La disponibilidad de funciones puede variar según el plan, la región, el dispositivo y el estado de desarrollo de la Plataforma.
          </p>
        </TermsSection>

        <TermsSection title="4. Requisitos de uso y elegibilidad">
          <p>Al usar la Plataforma declaras que:</p>
          <TermsList
            items={[
              <>Tienes capacidad legal para aceptar estos Términos.</>,
              <>Si eres menor de edad, usas la Plataforma con autorización y supervisión de tu madre/padre o tutor legal (según la legislación aplicable).</>,
            ]}
          />
          <p>
            El Titular puede restringir el uso a ciertas edades o requerir verificación adicional si resulta necesario.
          </p>
        </TermsSection>

        <TermsSection title="5. Registro de cuenta y seguridad">
          <p>Para acceder a ciertas funciones, podrías necesitar crear una Cuenta.</p>
          <TermsList
            items={[
              <>Eres responsable de la veracidad y actualización de la información de tu Cuenta.</>,
              <>Debes mantener la confidencialidad de tus credenciales y notificar de inmediato cualquier uso no autorizado.</>,
              <>El Titular puede suspender o cancelar Cuentas cuando exista uso indebido o riesgo de seguridad.</>,
            ]}
          />
        </TermsSection>

        <TermsSection title="6. Planes, suscripciones y pagos">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-content-primary">6.1. Plan gratuito y plan de pago</h4>
              <p className="mt-2">
                La Plataforma puede ofrecer un plan gratuito con funciones limitadas y un plan de pago (<strong>GOKAI+</strong>) con funciones ampliadas.
              </p>
              <p>
                Las características incluidas en cada plan, precios, moneda, periodos de facturación y promociones se muestran en la Plataforma al momento de la compra.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-content-primary">6.2. Facturación recurrente</h4>
              <p className="mt-2">
                Si contratas una suscripción, autorizas el cobro recurrente conforme al periodo contratado (por ejemplo, mensual). La suscripción se renovará automáticamente hasta que la canceles.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-content-primary">6.3. Procesamiento de pagos</h4>
              <p className="mt-2">
                Los pagos son procesados por proveedores de pago de terceros (por ejemplo, Stripe u otros). En ese caso:
              </p>
              <TermsList
                items={[
                  <>El proveedor puede requerir información adicional y aplicar sus propios términos y políticas.</>,
                  <>El Titular no almacena necesariamente la información completa de tu tarjeta, según el flujo del proveedor.</>,
                ]}
              />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-content-primary">6.4. Cupones y promociones</h4>
              <p className="mt-2">Si la Plataforma ofrece cupones o promociones:</p>
              <TermsList
                items={[
                  <>Estarán sujetos a condiciones específicas (vigencia, elegibilidad, no acumulables, etc.).</>,
                  <>El Titular puede invalidar cupones en caso de abuso, fraude o uso contrario a sus reglas.</>,
                ]}
              />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-content-primary">6.5. Cancelación</h4>
              <p className="mt-2">
                Puedes cancelar tu suscripción en cualquier momento desde las opciones disponibles en la Plataforma.
              </p>
              <p>Salvo que se indique lo contrario, la cancelación:</p>
              <TermsList
                items={[
                  <>Detiene la <strong>renovación automática</strong>.</>,
                  <>Mantiene el acceso a funciones de pago <strong>hasta el final del periodo de facturación vigente</strong>.</>,
                ]}
              />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-content-primary">6.6. Reembolsos</h4>
              <p className="mt-2">
                Salvo obligación legal o indicación expresa en la Plataforma, los cargos de suscripción no son reembolsables y no se otorgan reembolsos prorrateados por periodos parcialmente utilizados.
              </p>
            </div>
          </div>
        </TermsSection>

        <TermsSection title="7. Uso permitido y reglas de conducta">
          <p>El Usuario se compromete a utilizar la Plataforma de forma lícita y conforme a estos Términos.</p>
          <p>Queda prohibido, entre otros:</p>
          <TermsList
            items={[
              <>Usar la Plataforma para actividades ilegales o que vulneren derechos de terceros.</>,
              <>Interferir con el funcionamiento de la Plataforma (por ejemplo, ataques, scraping abusivo, ingeniería inversa no permitida, elusión de medidas técnicas, etc.).</>,
              <>Compartir o revender accesos, o permitir el uso de tu Cuenta por terceros de manera no autorizada.</>,
              <>Subir, enviar o procesar contenido que sea difamatorio, infrinja propiedad intelectual, o invada la privacidad de terceros.</>,
            ]}
          />
          <p>
            El Titular puede adoptar medidas razonables de moderación y seguridad, incluyendo la suspensión temporal o definitiva del acceso.
          </p>
        </TermsSection>

        <TermsSection title="8. Propiedad intelectual">
          <p>
            Salvo que se indique lo contrario, la Plataforma (incluyendo diseño, marca, textos, organización, funcionalidades y materiales) pertenece al Titular o cuenta con licencias para su uso.
          </p>
          <p>
            El Usuario obtiene una licencia personal, limitada, no exclusiva, no transferible y revocable para usar la Plataforma únicamente para fines personales y conforme a estos Términos.
          </p>
        </TermsSection>

        <TermsSection title="9. Contenido del Usuario">
          <p>El Usuario conserva los derechos que correspondan sobre su Contenido del Usuario.</p>
          <p>
            Sin embargo, al subir o generar Contenido del Usuario en la Plataforma, otorgas al Titular una licencia mundial, no exclusiva, libre de regalías y limitada a:
          </p>
          <TermsList
            items={[
              <>operar la Plataforma;</>,
              <>almacenar y procesar el Contenido del Usuario para prestar el servicio;</>,
              <>generar retroalimentación, métricas, reportes de progreso y recomendaciones;</>,
              <>mantener copias de seguridad y prevenir fraude/abuso.</>,
            ]}
          />
          <p>
            El Usuario declara y garantiza que cuenta con los derechos y autorizaciones necesarias para proporcionar dicho contenido (incluyendo, cuando aplique, la voz de terceros).
          </p>
        </TermsSection>

        <TermsSection title="10. Funciones de IA">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-content-primary">10.1. Naturaleza del servicio de IA</h4>
              <p className="mt-2">
                Algunas funciones de la Plataforma usan sistemas automatizados que pueden generar respuestas, sugerencias, correcciones o retroalimentación.
              </p>
              <p>Estas funciones:</p>
              <TermsList
                items={[
                  <>pueden contener errores o imprecisiones;</>,
                  <>no sustituyen asesoría profesional (por ejemplo, educativa especializada, médica, legal u otra);</>,
                  <>se proporcionan como apoyo al aprendizaje y práctica.</>,
                ]}
              />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-content-primary">10.2. IA de pronunciación</h4>
              <p className="mt-2">
                La Plataforma puede permitirte grabar o subir audio para analizar tu pronunciación. Al usar esta función:
              </p>
              <TermsList
                items={[
                  <>autorizas el procesamiento automatizado del audio con fines de evaluación y retroalimentación;</>,
                  <>reconoces que los resultados son estimaciones y pueden variar según ruido, micrófono, acento, velocidad del habla y otros factores;</>,
                  <>te comprometes a no subir audio que infrinja derechos de terceros o que contenga información sensible de otras personas sin su consentimiento.</>,
                ]}
              />
              <p>
                El Titular podrá ajustar la precisión, umbrales de evaluación y métodos de análisis conforme evolucione la funcionalidad.
              </p>
            </div>
          </div>
        </TermsSection>

        <TermsSection title="11. Privacidad y tratamiento de datos">
          <p>
            El uso de la Plataforma también está sujeto a la <strong>Política de Privacidad</strong>, la cual describe el tratamiento de datos personales, incluyendo, cuando aplique, audio de voz y métricas de aprendizaje: <strong>Política de Privacidad</strong>.
          </p>
          <p>
            En ausencia de un documento separado, el Titular tratará los datos del Usuario conforme a la legislación aplicable y a prácticas razonables de seguridad y minimización.
          </p>
        </TermsSection>

        <TermsSection title="12. Disponibilidad del servicio y cambios">
          <p>
            El Titular se esfuerza por mantener la Plataforma disponible, pero no garantiza acceso ininterrumpido. Podrían presentarse interrupciones por mantenimiento, mejoras, incidencias o causas fuera de control.
          </p>
          <p>
            El Titular puede modificar, actualizar o descontinuar funcionalidades total o parcialmente. Cuando el cambio afecte de forma material a una suscripción activa, el Titular procurará informar por medios razonables.
          </p>
        </TermsSection>

        <TermsSection title="13. Enlaces y servicios de terceros">
          <p>
            La Plataforma puede incluir enlaces o integraciones de terceros (por ejemplo, procesadores de pago, redes sociales u otros). El uso de dichos servicios queda sujeto a los términos y políticas de esos terceros.
          </p>
          <p>
            El Titular no es responsable por el contenido, disponibilidad o prácticas de terceros ajenos.
          </p>
        </TermsSection>

        <TermsSection title="14. Suspensión y terminación">
          <p>El Titular puede suspender o terminar el acceso a la Plataforma, con o sin aviso, si:</p>
          <TermsList
            items={[
              <>el Usuario incumple estos Términos;</>,
              <>existe sospecha razonable de fraude, abuso o riesgo de seguridad;</>,
              <>lo exige la ley o una autoridad competente.</>,
            ]}
          />
          <p>
            El Usuario puede dejar de usar la Plataforma en cualquier momento. Si existe suscripción activa, debe cancelarla para evitar renovaciones.
          </p>
        </TermsSection>

        <TermsSection title="15. Exclusión de garantías">
          <p>
            En la medida permitida por la ley, la Plataforma se proporciona “tal cual” y “según disponibilidad”, sin garantías de ningún tipo, ya sean expresas o implícitas.
          </p>
          <p>El Titular no garantiza que:</p>
          <TermsList
            items={[
              <>el servicio sea ininterrumpido o libre de errores;</>,
              <>los resultados de aprendizaje cumplan expectativas particulares;</>,
              <>la retroalimentación de IA sea siempre exacta o adecuada para todos los casos.</>,
            ]}
          />
        </TermsSection>

        <TermsSection title="16. Limitación de responsabilidad">
          <p>
            En la medida permitida por la legislación aplicable, el Titular no será responsable por daños indirectos, incidentales, especiales, consecuenciales o punitivos, ni por pérdida de datos, pérdida de ingresos o interrupción del negocio, derivados del uso o imposibilidad de uso de la Plataforma.
          </p>
          <p>
            Si por disposición legal existiera responsabilidad, esta se limitará al monto efectivamente pagado por el Usuario al Titular por la suscripción en el periodo inmediatamente anterior al hecho que dio origen al reclamo (o al mínimo permitido por ley).
          </p>
        </TermsSection>

        <TermsSection title="17. Indemnización">
          <p>El Usuario se obliga a indemnizar y mantener en paz y a salvo al Titular ante reclamaciones de terceros derivadas de:</p>
          <TermsList
            items={[
              <>el uso indebido de la Plataforma;</>,
              <>el incumplimiento de estos Términos;</>,
              <>el Contenido del Usuario que infrinja derechos de terceros.</>,
            ]}
          />
        </TermsSection>

        <TermsSection title="18. Modificaciones de estos Términos">
          <p>
            El Titular puede actualizar estos Términos cuando sea necesario. La fecha de <strong>“Última actualización”</strong> indicará el momento del cambio.
          </p>
          <p>
            Si continúas usando la Plataforma después de la publicación de cambios, se entenderá que aceptas los Términos actualizados. Si no estás de acuerdo, debes dejar de usar la Plataforma y, en su caso, cancelar tu suscripción.
          </p>
        </TermsSection>

        <TermsSection title="19. Ley aplicable y jurisdicción">
          <p>Estos Términos se regirán por las leyes de <strong>[México]</strong>.</p>
          <p>
            Salvo que la normativa aplicable disponga otra cosa, cualquier controversia relacionada con estos Términos se someterá a la jurisdicción de los tribunales competentes de <strong>[Jalisco]</strong>.
          </p>
        </TermsSection>

        <TermsSection title="20. Contacto">
          <p>Para dudas, comentarios o solicitudes relacionadas con estos Términos, puedes contactar al Titular en:</p>
          <TermsList items={[<>gokai.learn@gmail.com</>]} />
        </TermsSection>
      </div>

      <div className="mt-4 flex flex-col-reverse gap-2.5 border-t border-border-subtle pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:mt-5 sm:flex-row sm:justify-end sm:gap-3 sm:pt-5 sm:pb-0">
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
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-content-inverted shadow-sm transition hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-red-200"
        >
          Aceptar términos
        </motion.button>
      </div>
    </motion.section>
  );
}