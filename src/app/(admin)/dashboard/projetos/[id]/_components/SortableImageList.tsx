'use client'

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, LoaderCircle, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { ProjectImage } from '@/lib/api/projects'

interface SortableImageRowProps {
  image: ProjectImage
  deleting: boolean
  onDelete: (id: string) => void
}

function SortableImageRow({ image, deleting, onDelete }: SortableImageRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border-muted flex items-center gap-3 border bg-white/50 p-3"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-primary/25 hover:text-primary/50 shrink-0 cursor-grab touch-none transition-colors active:cursor-grabbing"
        aria-label="Arrastar para reordenar"
      >
        <GripVertical size={16} strokeWidth={1.5} aria-hidden="true" />
      </button>

      <div
        className="bg-muted relative h-12 w-20 shrink-0 overflow-hidden"
        style={{
          backgroundImage: `url(${image.url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <span className="text-primary/60 min-w-0 flex-1 truncate text-sm">
        {image.alt ?? image.url}
      </span>

      <button
        type="button"
        aria-label="Remover imagem"
        disabled={deleting}
        onClick={() => onDelete(image.id)}
        className="text-primary/30 hover:text-accent shrink-0 transition-colors disabled:pointer-events-none disabled:opacity-40"
      >
        {deleting ? (
          <LoaderCircle size={15} strokeWidth={1.5} className="animate-spin" aria-hidden="true" />
        ) : (
          <Trash2 size={15} strokeWidth={1.5} aria-hidden="true" />
        )}
      </button>
    </div>
  )
}

interface SortableImageListProps {
  images: ProjectImage[]
  deleting: Set<string>
  onDelete: (id: string) => void
  onReorder: (ids: string[]) => void
}

export function SortableImageList({
  images,
  deleting,
  onDelete,
  onReorder,
}: SortableImageListProps) {
  const [items, setItems] = useState(images)

  // Sync when parent refreshes (new images added or deleted)
  if (
    images.length !== items.length ||
    images.some((img, i) => img.id !== items[i]?.id || img.url !== items[i]?.url)
  ) {
    setItems(images)
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((img) => img.id === active.id)
    const newIndex = items.findIndex((img) => img.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex)
    setItems(reordered)
    onReorder(reordered.map((img) => img.id))
  }

  if (items.length === 0) return null

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((img) => img.id)} strategy={verticalListSortingStrategy}>
        <div className="grid gap-2">
          {items.map((image) => (
            <SortableImageRow
              key={image.id}
              image={image}
              deleting={deleting.has(image.id)}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
