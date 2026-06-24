"use client";

/**
 * A themed dropdown selector component styled according to Meta Consultoria's design guidelines.
 *
 * @param {Object} props - Component properties.
 * @param {string} props.value - The currently selected active value.
 * @param {function} props.onChange - Event callback triggered when a selection changes.
 * @param {[string, string][]} props.options - Array of key-label tuples representing option elements ([value, label]).
 * @returns {JSX.Element} The styled Select input element.
 */
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
