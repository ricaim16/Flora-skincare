"use client";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-purple-100 bg-white px-4 py-3">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="rounded-full border border-purple-200 px-4 py-2 text-sm font-semibold text-purple-900 disabled:opacity-40"
      >
        Previous
      </button>
      <div className="text-sm font-semibold text-purple-700">
        Page {currentPage} of {totalPages}
      </div>
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="rounded-full border border-purple-200 px-4 py-2 text-sm font-semibold text-purple-900 disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
