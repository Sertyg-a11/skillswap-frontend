export default function Button({ variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed'
  const styles =
    variant === 'secondary'
      ? 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
      : 'bg-blue-600 text-white hover:bg-blue-700'
  return <button className={`${base} ${styles} ${className}`} {...props} />
}
