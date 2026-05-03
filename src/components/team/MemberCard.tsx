import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { TeamMember } from '@/lib/team'

interface MemberCardProps {
  member: TeamMember
  index: number
}

export function MemberCard({ member, index }: MemberCardProps) {
  const inverted = index % 2 === 1

  return (
    <article className="grid gap-8 border-t border-[#EFDFBB]/15 py-10 lg:grid-cols-2 lg:gap-14 lg:py-14">
      <div
        className={cn(
          'group bg-primary relative aspect-[4/5] overflow-hidden',
          inverted && 'lg:order-2'
        )}
      >
        <Image
          src={member.photoUrl}
          alt={`Foto de ${member.name}`}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover grayscale transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      <div
        className={cn(
          'flex flex-col justify-center lg:max-w-lg',
          inverted && 'lg:order-1 lg:justify-self-end'
        )}
      >
        <p className="mb-4 text-[11px] tracking-[0.2em] text-[#EFDFBB]/50 uppercase">
          {member.role}
        </p>
        <h2 className="font-display text-4xl leading-tight font-light text-[#EFDFBB] lg:text-5xl">
          {member.name}
        </h2>
        <p className="mt-8 text-base leading-relaxed text-[#EFDFBB]/70 lg:text-lg">{member.bio}</p>
      </div>
    </article>
  )
}
