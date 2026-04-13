interface AdminTableLoadingRowsProps {
  columnCount: number;
  rowCount?: number;
}

const widthClasses = [
  "w-16",
  "w-28",
  "w-36",
  "w-20",
  "w-14",
  "w-24",
  "w-20",
  "w-24",
  "w-16",
];

export function AdminTableLoadingRows({
  columnCount,
  rowCount = 6,
}: AdminTableLoadingRowsProps) {
  return Array.from({ length: rowCount }, (_, rowIndex) => (
    <tr
      key={`admin-loading-row-${rowIndex}`}
      className="border-b border-border-subtle last:border-0"
    >
      {Array.from({ length: columnCount }, (_, columnIndex) => {
        const widthClass =
          widthClasses[columnIndex] ?? widthClasses[widthClasses.length - 1];
        const showAvatar = columnIndex === 1;

        return (
          <td
            key={`admin-loading-cell-${rowIndex}-${columnIndex}`}
            className="px-2.5 py-3 sm:px-3 lg:px-4"
          >
            {showAvatar ? (
              <div className="flex items-center gap-2.5">
                <span className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-surface-tertiary" />
                <span
                  className={`block h-3.5 animate-pulse rounded-full bg-surface-tertiary ${widthClass}`}
                />
              </div>
            ) : (
              <span
                className={`block h-3.5 animate-pulse rounded-full bg-surface-tertiary ${widthClass}`}
              />
            )}
          </td>
        );
      })}
    </tr>
  ));
}