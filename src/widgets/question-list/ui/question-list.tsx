import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import type { Question } from "@entities/question";
import { questionTypeLabel } from "@entities/session";
import { cn } from "@shared/lib/cn";

export function QuestionList({
  questions,
  selectedId,
  canEdit,
  onSelect,
  onReorder,
}: {
  questions: Question[];
  selectedId: string | null;
  canEdit: boolean;
  onSelect: (id: string) => void;
  onReorder: (ids: string[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = questions.map((question) => question.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(ids, oldIndex, newIndex));
  }

  if (questions.length === 0) {
    return <p className="text-sm text-stone-500">В игре ещё нет вопросов.</p>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={questions.map((question) => question.id)} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2">
          {questions.map((question) => (
            <SortableQuestion
              key={question.id}
              question={question}
              selected={question.id === selectedId}
              canEdit={canEdit}
              onSelect={onSelect}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableQuestion({
  question,
  selected,
  canEdit,
  onSelect,
}: {
  question: Question;
  selected: boolean;
  canEdit: boolean;
  onSelect: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: question.id,
    disabled: !canEdit,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-2 rounded-2xl border px-2 py-2 backdrop-blur transition",
        selected
          ? "border-orange-400/80 bg-orange-50/80 shadow-sm shadow-orange-600/10"
          : "border-white/60 bg-white/45 hover:bg-white/70",
      )}
    >
      {canEdit ? (
        <button
          type="button"
          className="cursor-grab rounded-lg p-2 text-stone-500 hover:bg-white/80"
          aria-label="Перетащить вопрос"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>
      ) : (
        <span className="w-2" />
      )}
      <button type="button" className="min-w-0 flex-1 px-1 py-1 text-left" onClick={() => onSelect(question.id)}>
        <span className="block truncate text-sm font-medium">
          {question.position}. {question.text}
        </span>
        <span className="text-xs text-stone-500">
          {question.category ? `${question.category} · ` : ""}
          {questionTypeLabel[question.type]} · {question.points} б. · {question.time_limit_sec} с
        </span>
      </button>
    </li>
  );
}
