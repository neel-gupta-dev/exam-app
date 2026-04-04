export default function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  return (
    <div className="pagination">
      <button className="btn btn-sm" onClick={() => onPage(1)} disabled={page === 1}>«</button>
      <button className="btn btn-sm" onClick={() => onPage(page - 1)} disabled={page === 1}>‹ Prev</button>
      <span>Page {page} of {pages}</span>
      <button className="btn btn-sm" onClick={() => onPage(page + 1)} disabled={page === pages}>Next ›</button>
      <button className="btn btn-sm" onClick={() => onPage(pages)} disabled={page === pages}>»</button>
    </div>
  );
}
