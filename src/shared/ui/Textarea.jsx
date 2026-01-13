export default function Textarea(props) {
  return (
    <textarea
      {...props}
      className={[
        "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900",
        "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400",
        props.className || "",
      ].join(" ")}
    />
  );
}
