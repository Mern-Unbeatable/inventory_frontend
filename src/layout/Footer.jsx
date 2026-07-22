export function Footer() {
  return (
    <footer className="border-t border-slate-200 px-4 py-4 text-center text-xs text-slate-400 sm:px-6">
      © {new Date().getFullYear()} Inventory Management · Internal use
    </footer>
  );
}
