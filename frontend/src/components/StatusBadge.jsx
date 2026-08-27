export default function StatusBadge({ value }) {
  return <span className={`badge badge-${value.toLowerCase()}`}>{value.replaceAll("_", " ")}</span>;
}
