"use client";

export function MetaSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-[38px] cursor-pointer rounded-[10px] border border-meta-navy-10 bg-white px-3 text-[13px] font-medium text-meta-navy-70 outline-none transition-colors hover:border-meta-navy-30 focus:border-meta-blue"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}
