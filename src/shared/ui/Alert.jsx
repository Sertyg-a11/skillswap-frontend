export default function Alert({ title = "Error", children }) {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
      <div className="text-sm font-semibold text-rose-900">{title}</div>
      <div className="mt-1 text-sm text-rose-800">{children}</div>
    </div>
  );
}
