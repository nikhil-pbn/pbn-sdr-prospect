import { STATS } from "@/content/hero";
import { cn } from "@/lib/utils";
import { CountUp, CountUpGroup } from "./count-up";
import { ProspectContainer } from "./prospect-primitives";

/**
 * Which cells get a left-hand divider. Four across on wide screens: every cell
 * but the first. Two-by-two below that: only the right-hand column, so each
 * row shows one centre line and nothing runs between the rows.
 */
function dividerClass(index: number): string {
  if (index % 2 === 1) return "border-l";
  if (index > 0) return "lg:border-l";
  return "";
}

/**
 * The four figures under the hero, counting up together the first time they
 * scroll into view — the PbN Voice StatsSection on the prospect mock's navy bar.
 */
export function ProspectStats() {
  return (
    <section className="px-6 py-6 lg:py-10">
      <ProspectContainer>
        <CountUpGroup className="grid grid-cols-2 gap-y-12 rounded-3xl bg-(--prospect-navy-deep) px-4 py-10 text-(--prospect-on-dark) sm:px-8 lg:grid-cols-4 lg:gap-y-0 lg:px-10 lg:py-12">
          {STATS.map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                "flex flex-col items-center justify-center gap-2 border-white/25 px-3 text-center",
                dividerClass(index),
              )}
            >
              <p className="text-[24px] font-extrabold tracking-tight sm:text-4xl md:text-5xl">
                <CountUp value={stat.value} />
              </p>
              <p className="text-[19px] leading-snug text-(--prospect-on-dark-muted)">
                {stat.label}
              </p>
            </div>
          ))}
        </CountUpGroup>
      </ProspectContainer>
    </section>
  );
}
