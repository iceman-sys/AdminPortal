function Block({ width, height = 14 }: { width: string | number; height?: number }) {
  return (
    <div
      className="skeleton"
      style={{
        width: typeof width === "number" ? width : width,
        height,
        borderRadius: 6,
      }}
    />
  );
}

export function PageHeaderSkeleton({ withActions = true }: { withActions?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 16,
      }}
    >
      <div>
        <Block width={180} height={28} />
        <div style={{ marginTop: 10 }}>
          <Block width={320} height={14} />
        </div>
      </div>
      {withActions ? <Block width={120} height={36} /> : null}
    </div>
  );
}

export function KpiGridSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="card">
          <Block width={100} height={12} />
          <div style={{ marginTop: 12 }}>
            <Block width={72} height={34} />
          </div>
          <div style={{ marginTop: 10 }}>
            <Block width={120} height={13} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: 12,
          padding: "12px 14px",
          borderBottom: "1px solid var(--border)",
          background: "#f8fafc",
        }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Block key={i} width="70%" height={12} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gap: 12,
            padding: "14px",
            borderBottom: row < rows - 1 ? "1px solid var(--border)" : undefined,
          }}
        >
          {Array.from({ length: cols }).map((_, col) => (
            <Block key={col} width={col === 0 ? "90%" : "60%"} height={14} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DashboardLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <KpiGridSkeleton />
      <div className="card" style={{ marginTop: 16 }}>
        <Block width={100} height={12} />
        <div style={{ marginTop: 14, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Block width={140} height={16} />
          <Block width={160} height={16} />
          <Block width={120} height={16} />
        </div>
      </div>
      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
          gap: 16,
        }}
      >
        <div>
          <div style={{ marginBottom: 10 }}>
            <Block width={140} height={18} />
          </div>
          <TableSkeleton rows={6} cols={5} />
        </div>
        <div className="card">
          <Block width={160} height={18} />
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {[0, 1, 2, 3].map((i) => (
              <Block key={i} width="100%" height={44} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ListPageLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <div style={{ marginBottom: 12 }}>
        <Block width={200} height={13} />
      </div>
      <TableSkeleton rows={10} cols={6} />
    </div>
  );
}

export function DetailPageLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <div className="card" style={{ marginBottom: 16 }}>
        <Block width="40%" height={20} />
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <Block width="80%" height={14} />
          <Block width="65%" height={14} />
          <Block width="72%" height={14} />
        </div>
      </div>
      <div className="card">
        <Block width={120} height={16} />
        <div style={{ marginTop: 12 }}>
          <Block width="100%" height={120} />
        </div>
      </div>
    </div>
  );
}
