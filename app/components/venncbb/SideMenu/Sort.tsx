import type { OrderBy } from "../../../routes/projects/venncbb";
import type { State } from "../../../lib/venncbb";
import Search from "./Search";

import { useState } from "react";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import SortCondition from "./SortCondition";
import type { Team } from "@prisma/client";
import TempSortCondition from "./TempSortCondition";

const Filter = ({
  colState,
  keys,
  orderByState,
}: {
  colState: State<string | undefined>;
  keys: string[];
  orderByState: State<OrderBy[]>;
}) => {
  const [orderBy, setOrderBy] = orderByState;

  const [activeId, setActiveId] = useState<string | undefined>();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="flex h-screen flex-1 flex-col justify-start border-gray-100 bg-white w-[20rem] gap-5">
      <div className="flex flex-row justify-center items-center mt-5 text-medium text-gray-900 border-b-2 pb-2 border-gray-100">
        Sort
      </div>
      <Search valueState={colState} keys={keys} />
      <div className="h-3/4 w-full">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderBy}
            strategy={verticalListSortingStrategy}
          >
            {orderBy
              // .filter((elem) => elem.id != activeId)
              .map(({ id, dir }, index) => (
                <SortCondition
                  key={index}
                  id={id}
                  dir={dir}
                  orderByState={orderByState}
                />
              ))}
          </SortableContext>

          <DragOverlay>
            {activeId && (
              <SortCondition
                id={activeId}
                dir={orderBy.find((elem) => activeId == elem.id)?.dir ?? "asc"}
                orderByState={orderByState}
              />
            )}
          </DragOverlay>
        </DndContext>
      </div>

      <TempSortCondition colState={colState} orderByState={orderByState} />
    </div>
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;

    setActiveId(active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const ids = orderBy.map((elem) => elem.id);

      const oldIndex = ids.indexOf(active.id as keyof Team);
      const newIndex = ids.indexOf(over.id as keyof Team);

      setOrderBy(arrayMove(orderBy, oldIndex, newIndex));
    }
    setActiveId(undefined);
  }
};

export default Filter;
