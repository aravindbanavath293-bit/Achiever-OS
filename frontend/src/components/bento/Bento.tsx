import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import clsx from 'clsx';

/* ──────────────────────────────────────────────────────────────
   Bento layout primitives
   Grid: 1 col (mobile) → 2 (sm) → 6 (md) → 12 (lg)
   Spans are literal Tailwind strings so the v4 scanner picks them up.
   ────────────────────────────────────────────────────────────── */

export type BentoSpan =
  | 'metric'   // small stat tile:   1/2 on sm, 3/6 on md, 3/12 on lg
  | 'third'    // medium tile:       full on sm, 3/6 on md, 4/12 on lg
  | 'half'     // half tile:         full on sm, 3/6 on md, 6/12 on lg
  | 'five'     // 5/12 companion to 'seven'
  | 'seven'    // 7/12 tile
  | 'two-thirds' // large tile:      full on md, 8/12 on lg
  | 'full';    // full-width tile

const SPAN_CLASSES: Record<BentoSpan, string> = {
  metric: 'col-span-1 md:col-span-3 lg:col-span-3',
  third: 'col-span-full md:col-span-3 lg:col-span-4',
  half: 'col-span-full md:col-span-3 lg:col-span-6',
  five: 'col-span-full md:col-span-6 lg:col-span-5',
  seven: 'col-span-full md:col-span-6 lg:col-span-7',
  'two-thirds': 'col-span-full md:col-span-6 lg:col-span-8',
  full: 'col-span-full',
};

const ROW_SPAN_CLASSES: Record<1 | 2 | 3, string> = {
  1: '',
  2: 'lg:row-span-2',
  3: 'lg:row-span-3',
};

export type BentoVariant = 'default' | 'feature' | 'accent' | 'muted';

interface BentoGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function BentoGrid({ children, className, ...rest }: BentoGridProps) {
  return (
    <div className={clsx('bento-grid', className)} {...rest}>
      {children}
    </div>
  );
}

interface BentoCardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  span?: BentoSpan;
  rowSpan?: 1 | 2 | 3;
  variant?: BentoVariant;
  interactive?: boolean;
  as?: ElementType;
}

export function BentoCard({
  children,
  span = 'third',
  rowSpan = 1,
  variant = 'default',
  interactive = false,
  as: Tag = 'section',
  className,
  ...rest
}: BentoCardProps) {
  return (
    <Tag
      className={clsx(
        'bento-card',
        variant !== 'default' && `bento-card--${variant}`,
        interactive && 'bento-card--interactive',
        SPAN_CLASSES[span],
        ROW_SPAN_CLASSES[rowSpan],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* Tone → luxury icon chip colours (Rose Gold, Deep Plum/Lilac, Sapphire, Light Gold/Amber, Coral, Slate) */
export type BentoTone = 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'slate';

const TONE_CLASSES: Record<BentoTone, string> = {
  indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
  violet: 'bg-violet-50 text-violet-700 border border-violet-200/60',
  emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  amber: 'bg-amber-50 text-amber-700 border border-amber-200/70',
  rose: 'bg-rose-50 text-rose-600 border border-rose-200/60',
  cyan: 'bg-blue-50 text-blue-700 border border-blue-200/60',
  slate: 'bg-slate-100 text-slate-600 border border-slate-200/70',
};

interface BentoCardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  tone?: BentoTone;
  badge?: ReactNode;
  action?: { label: string; to: string };
  /** Free-form right-hand slot (filters, buttons). Overrides `action`. */
  right?: ReactNode;
  id?: string;
}

export function BentoCardHeader({ title, subtitle, icon: Icon, tone = 'indigo', badge, action, right, id }: BentoCardHeaderProps) {
  return (
    <div className="bento-card__header">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <span className={clsx('bento-card__icon', TONE_CLASSES[tone])}>
            <Icon size={18} aria-hidden />
          </span>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 id={id} className="bento-card__title truncate">{title}</h2>
            {badge}
          </div>
          {subtitle && <p className="bento-card__subtitle truncate">{subtitle}</p>}
        </div>
      </div>
      {right ?? (action && (
        <Link to={action.to} className="bento-card__link">
          <span>{action.label}</span>
          <ArrowRight size={13} aria-hidden />
        </Link>
      ))}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: LucideIcon;
  tone?: BentoTone;
  valueClassName?: string;
  span?: BentoSpan;
  className?: string;
}

/** Small stat tile — label, big number, supporting hint. */
export function MetricCard({ label, value, hint, icon: Icon, tone = 'indigo', valueClassName, span = 'metric', className }: MetricCardProps) {
  return (
    <BentoCard span={span} as="div" className={clsx('justify-between gap-3', className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="bento-eyebrow">{label}</p>
        <span className={clsx('bento-card__icon w-9 h-9', TONE_CLASSES[tone])}>
          <Icon size={18} aria-hidden />
        </span>
      </div>
      <div>
        <p className={clsx('bento-metric', valueClassName ?? 'text-slate-900')}>{value}</p>
        {hint && <div className="text-xs font-medium text-slate-500 mt-0.5">{hint}</div>}
      </div>
    </BentoCard>
  );
}

/** Progress bar with an accessible value — never relies on colour alone. */
export function BentoProgress({ value, label, className }: { value: number; label: string; className?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={clsx('w-full h-2 rounded-full bg-slate-100 overflow-hidden', className)}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#582C8B] via-[#B86B58] to-[#D4AF37] transition-[width] duration-700 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Skeleton version of a bento layout, shown while async content resolves. */
export function BentoSkeleton() {
  return (
    <div className="bento-grid" aria-busy="true" aria-label="Loading workspace">
      <div className="bento-card col-span-full lg:col-span-8 gap-3">
        <div className="bento-skeleton h-4 w-40" />
        <div className="bento-skeleton h-8 w-3/4" />
        <div className="bento-skeleton h-4 w-1/2" />
      </div>
      <div className="bento-card col-span-full md:col-span-6 lg:col-span-4 gap-3">
        <div className="bento-skeleton h-24 w-24 rounded-full mx-auto" />
        <div className="bento-skeleton h-3 w-1/2 mx-auto" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bento-card col-span-1 md:col-span-3 lg:col-span-3 gap-3">
          <div className="bento-skeleton h-3 w-20" />
          <div className="bento-skeleton h-8 w-16" />
        </div>
      ))}
      <div className="bento-card col-span-full lg:col-span-8 gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bento-skeleton h-12 w-full" />)}
      </div>
      <div className="bento-card col-span-full lg:col-span-4 gap-2.5">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="bento-skeleton h-10 w-full" />)}
      </div>
    </div>
  );
}
