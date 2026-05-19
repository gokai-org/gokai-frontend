"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  FileText,
  ImageIcon,
  LayoutPanelTop,
  ListChecks,
  PenSquare,
  Plus,
  Rows4,
  Save,
  Trash2,
  X,
} from "lucide-react";
import GrammarExamplesSection from "@/features/graph/grammar/components/lesson/sections/GrammarExamplesSection";
import GrammarMeaningSection from "@/features/graph/grammar/components/lesson/sections/GrammarMeaningSection";
import GrammarLessonTable from "@/features/graph/grammar/components/lesson/GrammarLessonTable";
import type { ImageStepperComponent, TableComponent, TextStepperComponent } from "@/features/graph/grammar/types";
import type {
  AdminGrammarComponent,
  AdminGrammarComponentType,
  AdminGrammarExamItem,
  AdminGrammarImageStep,
  AdminGrammarLesson,
  AdminGrammarQuestionExam,
  AdminGrammarTableContent,
  AdminGrammarTextStep,
} from "../types/grammar";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type SectionKey = "meaning" | "howToUse" | "examples";

interface AdminLessonsModalProps {
  open: boolean;
  lesson: AdminGrammarLesson | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (payload: AdminGrammarLesson) => Promise<void>;
}

function cloneLesson(lesson: AdminGrammarLesson): AdminGrammarLesson {
  return JSON.parse(JSON.stringify(lesson)) as AdminGrammarLesson;
}

function cloneComponent(component: AdminGrammarComponent): AdminGrammarComponent {
  return JSON.parse(JSON.stringify(component)) as AdminGrammarComponent;
}

function sectionTitle(key: SectionKey) {
  if (key === "meaning") return "Meaning";
  if (key === "howToUse") return "HowToUse";
  return "Examples";
}

function componentTypeLabel(type: AdminGrammarComponentType) {
  if (type === "image_stepper") return "Stepper de imagen";
  if (type === "text_stepper") return "Stepper de texto";
  return "Tabla";
}

function createComponentByType(type: AdminGrammarComponentType): AdminGrammarComponent {
  if (type === "image_stepper") {
    return {
      type,
      content: [{ img: "", description: "" }],
    };
  }

  if (type === "text_stepper") {
    return {
      type,
      content: [{ kanji: "", kana: "", meaning: "" }],
    };
  }

  return {
    type,
    content: {
      headers: ["Columna 1"],
      rows: [{ cells: [{ value: "", rowspan: 1, colspan: 1 }] }],
    },
  };
}

type SectionComponentCache = Record<
  SectionKey,
  Record<AdminGrammarComponentType, AdminGrammarComponent>
>;

function buildSectionComponentCache(component: AdminGrammarComponent) {
  return {
    table:
      component.type === "table"
        ? cloneComponent(component)
        : createComponentByType("table"),
    image_stepper:
      component.type === "image_stepper"
        ? cloneComponent(component)
        : createComponentByType("image_stepper"),
    text_stepper:
      component.type === "text_stepper"
        ? cloneComponent(component)
        : createComponentByType("text_stepper"),
  };
}

function buildComponentCache(lesson: AdminGrammarLesson): SectionComponentCache {
  return {
    meaning: buildSectionComponentCache(lesson.content.meaning),
    howToUse: buildSectionComponentCache(lesson.content.howToUse),
    examples: buildSectionComponentCache(lesson.content.examples),
  };
}

function SectionTypeSelect({
  value,
  onChange,
}: {
  value: AdminGrammarComponentType;
  onChange: (value: AdminGrammarComponentType) => void;
}) {
  const options: AdminGrammarComponentType[] = ["table", "image_stepper", "text_stepper"];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={[
            "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
            value === option
              ? "border-accent bg-accent text-content-inverted"
              : "border-border-default bg-surface-secondary text-content-secondary hover:border-accent/35 hover:text-accent",
          ].join(" ")}
        >
          {componentTypeLabel(option)}
        </button>
      ))}
    </div>
  );
}

function PreviewCard({ component }: { component: AdminGrammarComponent }) {
  if (component.type === "table") {
    return <GrammarLessonTable table={component as TableComponent} />;
  }

  if (component.type === "image_stepper") {
    return <GrammarMeaningSection meaning={component as ImageStepperComponent} />;
  }

  return <GrammarExamplesSection examples={component as TextStepperComponent} />;
}

function FieldLabel({ label }: { label: string }) {
  return (
    <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.14em] text-content-tertiary">
      {label}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 4,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const className = "w-full rounded-xl border border-border-default bg-surface-primary px-3.5 py-2.5 text-sm text-content-primary outline-none transition-colors hover:border-border-default focus:border-accent/40";

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={className}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
}

function TableEditor({
  table,
  onChange,
}: {
  table: AdminGrammarTableContent;
  onChange: (next: AdminGrammarTableContent) => void;
}) {
  const updateHeader = (index: number, value: string) => {
    const headers = [...table.headers];
    headers[index] = value;
    onChange({ ...table, headers });
  };

  const updateCell = (rowIndex: number, cellIndex: number, value: string) => {
    const rows = table.rows.map((row, currentRowIndex) => {
      if (currentRowIndex !== rowIndex) return row;

      return {
        ...row,
        cells: row.cells.map((cell, currentCellIndex) => {
          if (currentCellIndex !== cellIndex) return cell;
          return { ...cell, value };
        }),
      };
    });

    onChange({ ...table, rows });
  };

  const addColumn = () => {
    const nextHeaderIndex = table.headers.length + 1;
    onChange({
      headers: [...table.headers, `Columna ${nextHeaderIndex}`],
      rows: table.rows.map((row) => ({
        ...row,
        cells: [...row.cells, { value: "", rowspan: 1, colspan: 1 }],
      })),
    });
  };

  const addRow = () => {
    onChange({
      ...table,
      rows: [
        ...table.rows,
        {
          cells: Array.from({ length: table.headers.length }, () => ({
            value: "",
            rowspan: 1,
            colspan: 1,
          })),
        },
      ],
    });
  };

  const removeRow = (rowIndex: number) => {
    if (table.rows.length <= 1) return;
    onChange({
      ...table,
      rows: table.rows.filter((_, index) => index !== rowIndex),
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addColumn}
          className="inline-flex items-center gap-2 rounded-xl border border-border-default px-3 py-2 text-xs font-semibold text-content-primary hover:border-accent/35 hover:text-accent"
        >
          <Rows4 className="h-4 w-4" />
          Agregar columna
        </button>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-2 rounded-xl border border-border-default px-3 py-2 text-xs font-semibold text-content-primary hover:border-accent/35 hover:text-accent"
        >
          <Plus className="h-4 w-4" />
          Agregar fila
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border-subtle">
        <table className="min-w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr className="bg-surface-secondary/65">
              {table.headers.map((header, index) => (
                <th key={`header-${index}`} className="px-2 py-2">
                  <TextInput value={header} onChange={(value) => updateHeader(index, value)} />
                </th>
              ))}
              <th className="px-2 py-2 text-xs text-content-tertiary">Acción</th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`} className="border-t border-border-subtle">
                {row.cells.map((cell, cellIndex) => (
                  <td key={`cell-${rowIndex}-${cellIndex}`} className="px-2 py-2 align-top">
                    <TextInput
                      value={cell.value}
                      onChange={(value) => updateCell(rowIndex, cellIndex, value)}
                      multiline
                      rows={3}
                    />
                  </td>
                ))}
                <td className="px-2 py-2 align-top">
                  <button
                    type="button"
                    onClick={() => removeRow(rowIndex)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 px-2 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Quitar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ImageStepperEditor({
  steps,
  onChange,
}: {
  steps: AdminGrammarImageStep[];
  onChange: (next: AdminGrammarImageStep[]) => void;
}) {
  const updateStep = (index: number, patch: Partial<AdminGrammarImageStep>) => {
    onChange(
      steps.map((step, currentIndex) =>
        currentIndex === index ? { ...step, ...patch } : step,
      ),
    );
  };

  const addStep = () => {
    onChange([...steps, { img: "", description: "" }]);
  };

  const removeStep = (index: number) => {
    if (steps.length <= 1) return;
    onChange(steps.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={`image-step-${index}`} className="rounded-2xl border border-border-subtle bg-surface-secondary/55 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-content-primary">Paso {index + 1}</p>
            <button
              type="button"
              onClick={() => removeStep(index)}
              className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 px-2 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Quitar
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <FieldLabel label="URL de imagen" />
              <TextInput value={step.img} onChange={(value) => updateStep(index, { img: value })} placeholder="https://..." />
            </div>
            <div>
              <FieldLabel label="Descripción" />
              <TextInput value={step.description} onChange={(value) => updateStep(index, { description: value })} multiline rows={4} />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addStep}
        className="inline-flex items-center gap-2 rounded-xl border border-border-default px-3 py-2 text-xs font-semibold text-content-primary hover:border-accent/35 hover:text-accent"
      >
        <Plus className="h-4 w-4" />
        Agregar paso visual
      </button>
    </div>
  );
}

function TextStepperEditor({
  steps,
  onChange,
}: {
  steps: AdminGrammarTextStep[];
  onChange: (next: AdminGrammarTextStep[]) => void;
}) {
  const updateStep = (index: number, patch: Partial<AdminGrammarTextStep>) => {
    onChange(
      steps.map((step, currentIndex) =>
        currentIndex === index ? { ...step, ...patch } : step,
      ),
    );
  };

  const addStep = () => {
    onChange([...steps, { kanji: "", kana: "", meaning: "" }]);
  };

  const removeStep = (index: number) => {
    if (steps.length <= 1) return;
    onChange(steps.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={`text-step-${index}`} className="rounded-2xl border border-border-subtle bg-surface-secondary/55 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-content-primary">Ejemplo {index + 1}</p>
            <button
              type="button"
              onClick={() => removeStep(index)}
              className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 px-2 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Quitar
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            <div>
              <FieldLabel label="Kanji" />
              <TextInput value={step.kanji} onChange={(value) => updateStep(index, { kanji: value })} />
            </div>
            <div>
              <FieldLabel label="Kana" />
              <TextInput value={step.kana} onChange={(value) => updateStep(index, { kana: value })} />
            </div>
          </div>

          <div className="mt-3">
            <FieldLabel label="Meaning" />
            <TextInput value={step.meaning} onChange={(value) => updateStep(index, { meaning: value })} multiline rows={4} />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addStep}
        className="inline-flex items-center gap-2 rounded-xl border border-border-default px-3 py-2 text-xs font-semibold text-content-primary hover:border-accent/35 hover:text-accent"
      >
        <Plus className="h-4 w-4" />
        Agregar ejemplo
      </button>
    </div>
  );
}

function SectionEditor({
  sectionKey,
  component,
  onChange,
  onTypeChange,
}: {
  sectionKey: SectionKey;
  component: AdminGrammarComponent;
  onChange: (next: AdminGrammarComponent) => void;
  onTypeChange: (nextType: AdminGrammarComponentType) => void;
}) {
  return (
    <section className="space-y-4 rounded-[24px] border border-border-subtle bg-surface-primary p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-accent/80">
            {sectionTitle(sectionKey)}
          </p>
          <h3 className="mt-1 text-base font-bold text-content-primary">
            Editor de bloque
          </h3>
        </div>

        <SectionTypeSelect
          value={component.type}
          onChange={onTypeChange}
        />
      </div>

      {component.type === "table" ? (
        <TableEditor
          table={component.content as AdminGrammarTableContent}
          onChange={(next) => onChange({ type: "table", content: next })}
        />
      ) : null}

      {component.type === "image_stepper" ? (
        <ImageStepperEditor
          steps={component.content as AdminGrammarImageStep[]}
          onChange={(next) => onChange({ type: "image_stepper", content: next })}
        />
      ) : null}

      {component.type === "text_stepper" ? (
        <TextStepperEditor
          steps={component.content as AdminGrammarTextStep[]}
          onChange={(next) => onChange({ type: "text_stepper", content: next })}
        />
      ) : null}
    </section>
  );
}

function ExamEditor({
  items,
  onChange,
}: {
  items: AdminGrammarExamItem[];
  onChange: (next: AdminGrammarExamItem[]) => void;
}) {
  const updateItem = (index: number, next: AdminGrammarExamItem) => {
    onChange(items.map((item, currentIndex) => (currentIndex === index ? next : item)));
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    onChange(items.filter((_, currentIndex) => currentIndex !== index));
  };

  const addItem = (type: AdminGrammarExamItem["type"]) => {
    if (type === "complete") {
      onChange([
        ...items,
        { type, question: "", options: [{ value: "1", text: "", correct: false }] },
      ]);
      return;
    }

    if (type === "order") {
      onChange([...items, { type, question: "", order: [""] }]);
      return;
    }

    onChange([...items, { type, question: "", options: [{ option: "", correct: false }] }]);
  };

  return (
    <section className="space-y-4 rounded-[24px] border border-border-subtle bg-surface-primary p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-accent/80">
            Exam
          </p>
          <h3 className="mt-1 text-base font-bold text-content-primary">
            Banco de ejercicios
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => addItem("question")} className="inline-flex items-center gap-2 rounded-xl border border-border-default px-3 py-2 text-xs font-semibold text-content-primary hover:border-accent/35 hover:text-accent">
            <Plus className="h-4 w-4" />
            Pregunta
          </button>
          <button type="button" onClick={() => addItem("complete")} className="inline-flex items-center gap-2 rounded-xl border border-border-default px-3 py-2 text-xs font-semibold text-content-primary hover:border-accent/35 hover:text-accent">
            <Plus className="h-4 w-4" />
            Completar
          </button>
          <button type="button" onClick={() => addItem("order")} className="inline-flex items-center gap-2 rounded-xl border border-border-default px-3 py-2 text-xs font-semibold text-content-primary hover:border-accent/35 hover:text-accent">
            <Plus className="h-4 w-4" />
            Ordenar
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`exam-${index}`} className="rounded-2xl border border-border-subtle bg-surface-secondary/55 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-content-primary">
                  Ejercicio {index + 1}
                </p>
                <p className="text-xs text-content-muted">{item.type}</p>
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 px-2 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Quitar
              </button>
            </div>

            <div>
              <FieldLabel label="Pregunta" />
              <TextInput
                value={item.question}
                onChange={(value) => updateItem(index, { ...item, question: value })}
                multiline
                rows={3}
              />
            </div>

            {item.type === "question" ? (
              <div className="mt-3 space-y-2">
                {item.options.map((option, optionIndex) => (
                  <div key={`question-option-${index}-${optionIndex}`} className="grid grid-cols-[1fr_auto] gap-2">
                    <TextInput
                      value={option.option}
                      onChange={(value) => {
                        updateItem(index, {
                          ...item,
                          options: item.options.map((entry, currentIndex) =>
                            currentIndex === optionIndex ? { ...entry, option: value } : entry,
                          ),
                        } as AdminGrammarQuestionExam);
                      }}
                    />
                    <label className="inline-flex items-center gap-2 rounded-xl border border-border-default px-3 text-xs font-semibold text-content-secondary">
                      <input
                        type="checkbox"
                        checked={option.correct}
                        onChange={(event) => {
                          updateItem(index, {
                            ...item,
                            options: item.options.map((entry, currentIndex) =>
                              currentIndex === optionIndex ? { ...entry, correct: event.target.checked } : entry,
                            ),
                          } as AdminGrammarQuestionExam);
                        }}
                      />
                      Correcta
                    </label>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => updateItem(index, { ...item, options: [...item.options, { option: "", correct: false }] } as AdminGrammarQuestionExam)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border-default px-3 py-2 text-xs font-semibold text-content-primary hover:border-accent/35 hover:text-accent"
                >
                  <Plus className="h-4 w-4" />
                  Agregar opción
                </button>
              </div>
            ) : null}

            {item.type === "complete" ? (
              <div className="mt-3 space-y-2">
                {item.options.map((option, optionIndex) => (
                  <div key={`complete-option-${index}-${optionIndex}`} className="grid grid-cols-1 gap-2 xl:grid-cols-[140px_1fr_auto]">
                    <TextInput
                      value={option.value}
                      onChange={(value) => {
                        updateItem(index, {
                          ...item,
                          options: item.options.map((entry, currentIndex) =>
                            currentIndex === optionIndex ? { ...entry, value } : entry,
                          ),
                        });
                      }}
                      placeholder="Valor"
                    />
                    <TextInput
                      value={option.text}
                      onChange={(value) => {
                        updateItem(index, {
                          ...item,
                          options: item.options.map((entry, currentIndex) =>
                            currentIndex === optionIndex ? { ...entry, text: value } : entry,
                          ),
                        });
                      }}
                      placeholder="Texto a mostrar"
                    />
                    <label className="inline-flex items-center gap-2 rounded-xl border border-border-default px-3 text-xs font-semibold text-content-secondary">
                      <input
                        type="checkbox"
                        checked={option.correct}
                        onChange={(event) => {
                          updateItem(index, {
                            ...item,
                            options: item.options.map((entry, currentIndex) =>
                              currentIndex === optionIndex ? { ...entry, correct: event.target.checked } : entry,
                            ),
                          });
                        }}
                      />
                      Correcta
                    </label>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => updateItem(index, { ...item, options: [...item.options, { value: String(item.options.length + 1), text: "", correct: false }] })}
                  className="inline-flex items-center gap-2 rounded-xl border border-border-default px-3 py-2 text-xs font-semibold text-content-primary hover:border-accent/35 hover:text-accent"
                >
                  <Plus className="h-4 w-4" />
                  Agregar opción
                </button>
              </div>
            ) : null}

            {item.type === "order" ? (
              <div className="mt-3 space-y-2">
                {item.order.map((step, orderIndex) => (
                  <TextInput
                    key={`order-option-${index}-${orderIndex}`}
                    value={step}
                    onChange={(value) => {
                      updateItem(index, {
                        ...item,
                        order: item.order.map((entry, currentIndex) =>
                          currentIndex === orderIndex ? value : entry,
                        ),
                      });
                    }}
                    placeholder={`Fragmento ${orderIndex + 1}`}
                  />
                ))}

                <button
                  type="button"
                  onClick={() => updateItem(index, { ...item, order: [...item.order, ""] })}
                  className="inline-flex items-center gap-2 rounded-xl border border-border-default px-3 py-2 text-xs font-semibold text-content-primary hover:border-accent/35 hover:text-accent"
                >
                  <Plus className="h-4 w-4" />
                  Agregar fragmento
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function AdminLessonsModalContent({
  lesson,
  saving,
  error,
  onClose,
  onSave,
}: Omit<AdminLessonsModalProps, "open"> & { lesson: AdminGrammarLesson }) {
  const [draft, setDraft] = useState<AdminGrammarLesson>(() => cloneLesson(lesson));
  const [componentCache, setComponentCache] = useState<SectionComponentCache>(() =>
    buildComponentCache(lesson),
  );

  const updateDraftSection = (sectionKey: SectionKey, nextComponent: AdminGrammarComponent) => {
    const clonedComponent = cloneComponent(nextComponent);

    setDraft((current) => {
      if (!current) return current;

      return {
        ...current,
        content: {
          ...current.content,
          [sectionKey]: clonedComponent,
        },
      };
    });

    setComponentCache((current) => {
      if (!current) return current;

      return {
        ...current,
        [sectionKey]: {
          ...current[sectionKey],
          [clonedComponent.type]: cloneComponent(clonedComponent),
        },
      };
    });
  };

  const handleSectionTypeChange = (
    sectionKey: SectionKey,
    nextType: AdminGrammarComponentType,
  ) => {
    const nextComponent =
      componentCache?.[sectionKey]?.[nextType] ?? createComponentByType(nextType);
    updateDraftSection(sectionKey, nextComponent);
  };

  const previewSections = useMemo(() => {
    return [
      { key: "meaning" as const, label: "Meaning", icon: ImageIcon },
      { key: "howToUse" as const, label: "HowToUse", icon: LayoutPanelTop },
      { key: "examples" as const, label: "Examples", icon: FileText },
    ];
  }, []);

  const isValid = useMemo(() => {
    return draft.title.trim().length > 0;
  }, [draft]);

  return (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            className="relative z-10 flex h-[94dvh] w-full max-w-[1600px] flex-col overflow-hidden rounded-[28px] bg-surface-primary shadow-2xl"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.985, y: 8 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-accent to-accent-hover px-6 pb-5 pt-6 sm:px-8 sm:pb-6 sm:pt-7">
              <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-surface-primary/5" />
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-primary/15 backdrop-blur-sm">
                    <BookOpen className="h-6 w-6 text-content-inverted" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-content-inverted sm:text-2xl">
                      Editar lección de gramática
                    </h2>
                    <p className="mt-1 text-sm text-white/72">
                      Ajusta el contenido tipado de meaning, howToUse, examples y exam.
                    </p>
                    <p className="mt-2 text-xs font-semibold text-white/80">ID: {draft.id}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-primary/10 text-white/70 transition-colors hover:bg-surface-primary/20 hover:text-content-inverted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.8fr)]">
              <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-6 xl:px-7">
                <div className="space-y-5 pb-8">
                  <section className="rounded-[24px] border border-border-subtle bg-surface-primary p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                      <div>
                        <FieldLabel label="Título" />
                        <TextInput
                          value={draft.title}
                          onChange={(value) => setDraft({ ...draft, title: value })}
                        />
                      </div>
                      <div>
                        <FieldLabel label="Puntos para desbloquear" />
                        <input
                          type="number"
                          min={0}
                          value={draft.pointsToUnlock ?? 0}
                          onChange={(event) => {
                            const nextValue = Number(event.target.value);
                            setDraft({
                              ...draft,
                              pointsToUnlock: Number.isFinite(nextValue) ? nextValue : 0,
                            });
                          }}
                          className="w-full rounded-xl border border-border-default bg-surface-primary px-3.5 py-2.5 text-sm text-content-primary outline-none transition-colors hover:border-border-default focus:border-accent/40"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <FieldLabel label="Descripción" />
                      <TextInput
                        value={draft.description ?? ""}
                        onChange={(value) => setDraft({ ...draft, description: value })}
                        multiline
                        rows={4}
                      />
                    </div>
                  </section>

                  <SectionEditor
                    sectionKey="meaning"
                    component={draft.content.meaning}
                    onTypeChange={(nextType) => handleSectionTypeChange("meaning", nextType)}
                    onChange={(next) => updateDraftSection("meaning", next)}
                  />

                  <SectionEditor
                    sectionKey="howToUse"
                    component={draft.content.howToUse}
                    onTypeChange={(nextType) => handleSectionTypeChange("howToUse", nextType)}
                    onChange={(next) => updateDraftSection("howToUse", next)}
                  />

                  <SectionEditor
                    sectionKey="examples"
                    component={draft.content.examples}
                    onTypeChange={(nextType) => handleSectionTypeChange("examples", nextType)}
                    onChange={(next) => updateDraftSection("examples", next)}
                  />

                  <ExamEditor
                    items={draft.content.exam}
                    onChange={(next) =>
                      setDraft({
                        ...draft,
                        content: { ...draft.content, exam: next },
                      })
                    }
                  />

                  {error ? (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                      {error}
                    </div>
                  ) : null}
                </div>
              </div>

              <aside className="min-h-0 overflow-y-auto border-t border-border-subtle bg-surface-secondary/35 px-5 py-5 sm:px-6 xl:border-l xl:border-t-0 xl:px-6">
                <div className="space-y-5 pb-8">
                  <div className="rounded-[24px] border border-border-subtle bg-surface-primary p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-content-primary">
                      <PenSquare className="h-4 w-4 text-accent" />
                      Vista previa estructural
                    </div>
                    <p className="mt-2 text-sm text-content-secondary">
                      Esta vista reutiliza los mismos componentes visuales de gramática de la vista del usuario.
                    </p>
                  </div>

                  {previewSections.map(({ key, label, icon: Icon }) => {
                    const component = draft.content[key];

                    return (
                      <section key={key} className="space-y-3 rounded-[24px] border border-border-subtle bg-surface-primary p-4 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-content-primary">{label}</p>
                            <p className="text-xs text-content-muted">{componentTypeLabel(component.type)}</p>
                          </div>
                        </div>

                        <PreviewCard component={component} />
                      </section>
                    );
                  })}

                  <section className="rounded-[24px] border border-border-subtle bg-surface-primary p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                        <ListChecks className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-content-primary">Resumen de examen</p>
                        <p className="text-xs text-content-muted">
                          {draft.content.exam.length} ejercicios configurados
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {draft.content.exam.map((item, index) => (
                        <div key={`exam-preview-${index}`} className="rounded-xl border border-border-subtle bg-surface-secondary/50 px-3 py-3">
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-accent/80">
                            {item.type}
                          </p>
                          <p className="mt-1 text-sm text-content-primary">{item.question || "Pregunta vacía"}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </aside>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border-subtle bg-surface-primary px-5 py-4 sm:px-6">
              <p className="text-sm text-content-secondary">
                Se enviará el payload completo de la lección a content con el mismo shape tipado.
              </p>

              <button
                type="button"
                onClick={() => void onSave(draft)}
                disabled={!isValid || saving}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-content-inverted shadow-sm transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save className="h-4 w-4" />
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </motion.div>
        </motion.div>
  );
}

export function AdminLessonsModal({
  open,
  lesson,
  saving,
  error,
  onClose,
  onSave,
}: AdminLessonsModalProps) {
  return (
    <AnimatePresence>
      {open && lesson ? (
        <AdminLessonsModalContent
          key={lesson.id}
          lesson={lesson}
          saving={saving}
          error={error}
          onClose={onClose}
          onSave={onSave}
        />
      ) : null}
    </AnimatePresence>
  );
}