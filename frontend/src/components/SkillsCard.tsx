import { Check, Code2, Plus } from "lucide-react";
export function SkillsCard({
  skills,
  selected,
  onChange,
}: {
  skills: string[];
  selected: string[];
  onChange: (items: string[]) => void;
}) {
  const toggle = (skill: string) =>
    onChange(
      selected.includes(skill)
        ? selected.filter((x) => x !== skill)
        : [...selected, skill],
    );
  return (
    <section className="panel skills-panel">
      <div className="panel-head">
        <div>
          <div className="eyebrow">WHAT I DO</div>
          <h3>Skills & expertise</h3>
          <p>Share what you bring to the team.</p>
        </div>
        <span className="count-pill">{selected.length} SELECTED</span>
      </div>
      <div className="skills-grid">
        {skills.map((skill, i) => {
          const active = selected.includes(skill);
          return (
            <button
              key={skill}
              onClick={() => toggle(skill)}
              className={`skill-chip ${active ? "selected" : ""}`}
            >
              <span className={`skill-icon skill-${i % 6}`}>
                {active ? <Check size={14} /> : <Code2 size={14} />}
              </span>
              {skill}
            </button>
          );
        })}
        <span className="configure-note">
          <Plus size={13} /> Options configured by your team
        </span>
      </div>
    </section>
  );
}
