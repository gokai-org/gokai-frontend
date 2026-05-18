"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

type CreditsAndAttributionsPanelProps = {
  onBack: () => void;
  onAccept: () => void;
};

function CreditsSection({
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

function ResourceLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-semibold text-accent transition-colors hover:text-accent-hover"
    >
      {children}
    </a>
  );
}

export function CreditsAndAttributionsPanel({
  onBack,
  onAccept,
}: CreditsAndAttributionsPanelProps) {
  return (
    <section
      id="landing-credits-panel"
      role="dialog"
      aria-labelledby="credits-title"
      className="h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] min-h-0 overflow-y-auto overscroll-contain pr-1 sm:h-auto sm:max-h-[78dvh] sm:min-h-[min(70dvh,760px)] md:pr-3"
    >
      <div className="border-b border-border-subtle pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-content-muted md:text-[11px]">
          GOKAI
        </p>
        <h2
          id="credits-title"
          className="mt-2 text-xl font-semibold tracking-tight text-content-primary md:text-2xl"
        >
          Créditos y atribuciones
        </h2>
        <p className="mt-1.5 text-xs leading-5 text-content-tertiary md:text-sm">
          <strong>Última actualización:</strong> 17 de mayo de 2026
        </p>
      </div>

      <div className="mt-4 space-y-4 sm:mt-5">
        <CreditsSection title="Recursos visuales">
          <p>
            GOKAI utiliza distintos recursos visuales, gráficos y multimedia con
            fines educativos, informativos y de experiencia de usuario dentro de
            la plataforma.
          </p>
          <p>
            Parte de los recursos utilizados fueron obtenidos de bibliotecas de
            contenido libre y plataformas de recursos gráficos, respetando sus
            respectivas licencias y condiciones de uso.
          </p>
          <div className="space-y-3 rounded-xl border border-border-default/70 bg-surface-primary/60 p-4">
            <h4 className="text-sm font-semibold text-content-primary md:text-base">
              Pixabay
            </h4>
          <p>
            Algunas imágenes y recursos multimedia utilizados en esta
            plataforma provienen de Pixabay. Dichos contenidos son utilizados
            conforme a la Licencia de Contenido de Pixabay, la cual permite el
            uso y modificación de recursos libres de regalías para proyectos
            digitales y educativos.
          </p>
          <p>
            <strong>Sitio oficial:</strong>{" "}
            <ResourceLink href="https://pixabay.com/">
              https://pixabay.com/
            </ResourceLink>
          </p>
          </div>
          <div className="space-y-3 rounded-xl border border-border-default/70 bg-surface-primary/60 p-4">
            <h4 className="text-sm font-semibold text-content-primary md:text-base">
              Vecteezy
            </h4>
          <p>
            Algunos vectores, ilustraciones e imágenes utilizados dentro de la
            interfaz y materiales visuales de GOKAI provienen de Vecteezy.
            Estos recursos son utilizados conforme a los términos y condiciones
            establecidos por la plataforma y sus respectivas licencias de uso.
          </p>
          <p>
            <strong>Atribución correspondiente:</strong> Vectores e
            ilustraciones por Vecteezy.
          </p>
          <p>
            <strong>Sitio oficial:</strong>{" "}
            <ResourceLink href="https://www.vecteezy.com/">
              https://www.vecteezy.com/
            </ResourceLink>
          </p>
          </div>
          <div className="space-y-3 rounded-xl border border-border-default/70 bg-surface-primary/60 p-4">
            <h4 className="text-sm font-semibold text-content-primary md:text-base">
              Notas legales
            </h4>
          <p>
            Todos los logotipos, marcas comerciales y nombres mencionados
            pertenecen a sus respectivos propietarios.
          </p>
          <p>
            Los recursos externos utilizados dentro de GOKAI han sido
            modificados, adaptados o integrados como parte del diseño y
            experiencia visual de la plataforma, sin intención de
            redistribuirlos de manera independiente.
          </p>
          <p>
            Si algún autor o propietario considera necesaria una corrección de
            atribución o contenido, puede solicitarlo mediante los canales
            oficiales de contacto del proyecto.
          </p>
          </div>
        </CreditsSection>

        <CreditsSection title="Contenido y recursos lingüísticos">
          <p>
            GOKAI utiliza distintos recursos educativos y lingüísticos para
            apoyar la enseñanza y visualización del idioma japonés dentro de la
            plataforma.
          </p>

          <div className="space-y-3 rounded-xl border border-border-default/70 bg-surface-primary/60 p-4">
            <h4 className="text-sm font-semibold text-content-primary md:text-base">
              KanjiVG
            </h4>
            <p>
              Este sitio web utiliza archivos SVG de KanjiVG (copyright ©
              2009-2026 Ulrich Apel), obtenidos desde su repositorio oficial en
              GitHub. Estos recursos son utilizados para la representación
              visual y práctica de trazos de caracteres kanji dentro de la
              plataforma.
            </p>
            <p>
              Los archivos de KanjiVG se encuentran bajo la licencia Creative
              Commons Attribution-Share Alike 3.0 (CC BY-SA 3.0).
            </p>
            <p>
              <strong>Repositorio oficial:</strong>{" "}
              <ResourceLink href="https://github.com/KanjiVG/kanjivg">
                https://github.com/KanjiVG/kanjivg
              </ResourceLink>
            </p>
            <p>
              <strong>Licencia oficial:</strong>{" "}
              <ResourceLink href="https://creativecommons.org/licenses/by-sa/3.0/">
                https://creativecommons.org/licenses/by-sa/3.0/
              </ResourceLink>
            </p>
            <p>
              <strong>Atribución correspondiente:</strong> KanjiVG © Ulrich
              Apel.
            </p>
          </div>

          <div className="space-y-3 rounded-xl border border-border-default/70 bg-surface-primary/60 p-4">
            <h4 className="text-sm font-semibold text-content-primary md:text-base">
              Notas legales
            </h4>
            <p>
              Los archivos SVG y recursos derivados utilizados dentro de GOKAI
              pueden haber sido adaptados o integrados visualmente para mejorar
              la experiencia educativa de la plataforma, respetando siempre las
              condiciones de atribución y compartición establecidas por la
              licencia original.
            </p>
          </div>
        </CreditsSection>

        <CreditsSection title="Inteligencia Artificial, bibliografía técnica y datasets">
          <p>
            GOKAI integra diferentes tecnologías, modelos y metodologías de
            Inteligencia Artificial, Procesamiento de Lenguaje Natural (NLP),
            análisis acústico y sistemas de recomendación con fines educativos,
            experimentales y de investigación aplicada dentro de la plataforma.
          </p>
          <p>
            El desarrollo de los módulos de Inteligencia Artificial utilizados
            en GOKAI se fundamenta en investigaciones académicas, bibliografía
            científica, bibliotecas open-source y conjuntos de datos públicos
            especializados en representación semántica de lenguaje, análisis de
            voz, embeddings, aprendizaje por refuerzo y reconocimiento
            acústico.
          </p>

          <div className="space-y-3 rounded-xl border border-border-default/70 bg-surface-primary/60 p-4">
            <h4 className="text-sm font-semibold text-content-primary md:text-base">
              Parte de las funcionalidades implementadas dentro de la plataforma
              incluyen
            </h4>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Sistemas de recomendación de contenidos personalizados.</li>
              <li>Representación semántica mediante embeddings vectoriales.</li>
              <li>
                Procesamiento de lenguaje natural aplicado al aprendizaje de
                japonés.
              </li>
              <li>Modelos de análisis acústico y pronunciación.</li>
              <li>
                Técnicas de aprendizaje por refuerzo para adaptación de
                contenidos.
              </li>
              <li>
                Análisis de patrones de interacción y progreso educativo.
              </li>
            </ul>
          </div>

          <div className="space-y-3 rounded-xl border border-border-default/70 bg-surface-primary/60 p-4">
            <h4 className="text-sm font-semibold text-content-primary md:text-base">
              Dependencias y tecnologías de IA utilizadas
            </h4>
            <p>
              GOKAI utiliza bibliotecas, modelos y tecnologías derivadas de
              investigaciones académicas y herramientas open-source reconocidas
              dentro del ámbito de Inteligencia Artificial y Machine Learning.
            </p>
          </div>

          <div className="space-y-3 rounded-xl border border-border-default/70 bg-surface-primary/60 p-4">
            <h4 className="text-sm font-semibold text-content-primary md:text-base">
              Sentence-BERT (SBERT)
            </h4>
            <p>
              Parte del sistema de embeddings semánticos y representación
              contextual de texto utilizado en GOKAI se basa en investigaciones
              relacionadas con Sentence-BERT desarrolladas por Nils Reimers e
              Iryna Gurevych.
            </p>
            <p>
              Estas investigaciones sirvieron como referencia conceptual para la
              representación vectorial de contenido educativo y recomendaciones
              inteligentes dentro de la plataforma.
            </p>
            <div>
              <p>
                <strong>Referencias académicas:</strong>
              </p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>
                  Reimers, N., Gurevych, I. (2019). “Sentence-BERT: Sentence
                  Embeddings using Siamese BERT-Networks.” Proceedings of
                  EMNLP-IJCNLP 2019. {" "}
                  <ResourceLink href="https://arxiv.org/abs/1908.10084">
                    https://arxiv.org/abs/1908.10084
                  </ResourceLink>
                </li>
                <li>
                  Reimers, N., Gurevych, I. (2020). “Making Monolingual Sentence
                  Embeddings Multilingual using Knowledge Distillation.”
                  Proceedings of EMNLP 2020. {" "}
                  <ResourceLink href="https://arxiv.org/abs/2004.09813">
                    https://arxiv.org/abs/2004.09813
                  </ResourceLink>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border-default/70 bg-surface-primary/60 p-4">
            <h4 className="text-sm font-semibold text-content-primary md:text-base">
              Librosa
            </h4>
            <p>
              GOKAI utiliza herramientas y metodologías relacionadas con el
              análisis digital de audio mediante la biblioteca open-source
              Librosa para procesamiento de voz y extracción de características
              acústicas.
            </p>
            <div>
              <p>
                <strong>Referencias:</strong>
              </p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>
                  McFee, B. et al. (2025). “librosa/librosa: 0.11.0.” Zenodo. {" "}
                  <ResourceLink href="https://doi.org/10.5281/zenodo.15006942">
                    https://doi.org/10.5281/zenodo.15006942
                  </ResourceLink>
                </li>
                <li>
                  McFee, B., Raffel, C., Liang, D., Ellis, D. P., McVicar, M.,
                  Battenberg, E., Nieto, O. (2015). “librosa: Audio and Music
                  Signal Analysis in Python.” SciPy 2015. {" "}
                  <ResourceLink href="https://doi.org/10.25080/Majora-7b98e3ed-003">
                    https://doi.org/10.25080/Majora-7b98e3ed-003
                  </ResourceLink>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border-default/70 bg-surface-primary/60 p-4">
            <h4 className="text-sm font-semibold text-content-primary md:text-base">
              Bibliografía de investigaciones utilizadas como referencia
            </h4>
            <p>
              El diseño conceptual, metodológico y experimental de los
              componentes de Inteligencia Artificial implementados en GOKAI fue
              apoyado por investigaciones académicas relacionadas con:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Grandes Modelos de Lenguaje (LLM).</li>
              <li>Procesamiento de Lenguaje Natural (NLP).</li>
              <li>Embeddings semánticos.</li>
              <li>Aprendizaje por refuerzo.</li>
              <li>Reconocimiento automático del habla.</li>
              <li>Análisis acústico.</li>
              <li>Redes neuronales aplicadas a voz y pronunciación.</li>
              <li>Sistemas de recomendación y personalización educativa.</li>
            </ul>
            <p>
              Entre las referencias consultadas se encuentran investigaciones y
              publicaciones de instituciones como:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Universidad de Antioquía.</li>
              <li>Universidad de Sevilla.</li>
              <li>Universidad de Granada.</li>
              <li>Universidad de San Carlos de Guatemala.</li>
              <li>Universidad Autónoma Metropolitana.</li>
              <li>ITESO.</li>
              <li>IEEE.</li>
              <li>Redalyc.</li>
              <li>Universidad Politécnica de Madrid.</li>
              <li>Universidad Nacional Autónoma de México.</li>
            </ul>
            <p>
              Las referencias completas incluyen trabajos de investigación de
              autores como:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Díaz, S.</li>
              <li>García, J.</li>
              <li>Borrego, J.</li>
              <li>Jiménez, J.</li>
              <li>Oliveros, V.</li>
              <li>Velasco, E.</li>
              <li>Montenegro, M.</li>
              <li>Menchaca, R.</li>
              <li>Gurlekian, J.</li>
              <li>Abdul, Z.</li>
              <li>González, V.</li>
              <li>López, R.</li>
              <li>Ramírez, A.</li>
              <li>Ramos, E.</li>
              <li>Rufiner, H.</li>
              <li>Vicente Cabero, J.</li>
              <li>Robles, J.</li>
            </ul>
            <p>
              Estas investigaciones fueron utilizadas exclusivamente como apoyo
              académico, referencia metodológica y fundamento conceptual para el
              desarrollo experimental de los módulos de Inteligencia Artificial
              implementados en GOKAI.
            </p>
          </div>

          <div className="space-y-3 rounded-xl border border-border-default/70 bg-surface-primary/60 p-4">
            <h4 className="text-sm font-semibold text-content-primary md:text-base">
              Dataset utilizado para entrenamiento experimental
            </h4>
            <p>
              <strong>FLEURS Dataset</strong>
            </p>
            <p>
              Parte de los modelos de Inteligencia Artificial utilizados dentro
              de GOKAI fueron entrenados utilizando extractos del conjunto de
              datos público “FLEURS — Few-shot Learning Evaluation of Universal
              Representations of Speech”.
            </p>
            <div>
              <p>
                <strong>Autores originales:</strong>
              </p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                <li>Alexis Conneau</li>
                <li>Min Ma</li>
                <li>Simran Khanuja</li>
                <li>Yu Zhang</li>
                <li>Vera Axelrod</li>
                <li>Siddharth Dalmia</li>
                <li>Jason Riesa</li>
                <li>Clara Rivera</li>
                <li>Ankur Bapna</li>
              </ul>
            </div>
            <p>
              El conjunto de datos fue obtenido mediante Hugging Face Datasets
              como parte de los recursos públicos de Google Research.
            </p>
            <p>
              <strong>Publicación oficial:</strong>{" "}
              <ResourceLink href="https://huggingface.co/datasets/google/fleurs">
                https://huggingface.co/datasets/google/fleurs
              </ResourceLink>
            </p>
            <p>
              <strong>Contribuidores de integración en Hugging Face:</strong>
              {" "}Patrick von Platen y Alex C.
            </p>
            <p>
              <strong>Artículo original:</strong>
            </p>
            <p>
              Conneau, A., Ma, M., Khanuja, S., Zhang, Y., Axelrod, V., Dalmia,
              S., Riesa, J., Rivera, C., Bapna, A. (2022). “FLEURS: Few-shot
              Learning Evaluation of Universal Representations of Speech.” IEEE
              Spoken Language Technology Workshop (SLT).{" "}
              <ResourceLink href="https://arxiv.org/abs/2205.12446">
                https://arxiv.org/abs/2205.12446
              </ResourceLink>
            </p>
            <p>
              <strong>Licencia oficial del dataset:</strong> Creative Commons
              Attribution 4.0 International (CC BY 4.0).{" "}
              <ResourceLink href="https://creativecommons.org/licenses/by/4.0/">
                https://creativecommons.org/licenses/by/4.0/
              </ResourceLink>
            </p>
            <p>
              El conjunto de datos utilizado dentro de GOKAI fue complementado
              parcialmente con contenido de elaboración propia para fines
              educativos, experimentales y de investigación académica.
            </p>
          </div>

          <div className="space-y-3 rounded-xl border border-border-default/70 bg-surface-primary/60 p-4">
            <h4 className="text-sm font-semibold text-content-primary md:text-base">
              Consideraciones legales y académicas
            </h4>
            <p>
              Todas las tecnologías, investigaciones, bibliotecas y conjuntos de
              datos mencionados pertenecen a sus respectivos autores,
              organizaciones y propietarios intelectuales.
            </p>
            <p>
              GOKAI no reclama propiedad sobre las investigaciones, datasets o
              herramientas utilizadas como referencia o dependencia
              tecnológica.
            </p>
            <p>
              Los recursos mencionados son utilizados con fines educativos,
              académicos, experimentales y de desarrollo tecnológico dentro del
              contexto del proyecto GOKAI, respetando las licencias
              open-source, académicas y de atribución correspondientes.
            </p>
          </div>
        </CreditsSection>
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
          Entendido
        </motion.button>
      </div>
    </section>
  );
}