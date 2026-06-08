import { Badge, formatDate } from "@/components/ui";
import { labelFootType } from "@/lib/labels";
import {
  captureModeTone,
  formatMm,
  hasFootMetrics,
  hasMeshExport,
  labelCaptureMode,
  type FootScanWithUrl,
} from "@/lib/foot-scans";

type Props = {
  scans: FootScanWithUrl[];
  emptyMessage?: string;
};

export function FootScanGallery({
  scans,
  emptyMessage = "This patient skipped the foot scan or no images were uploaded.",
}: Props) {
  if (!scans.length) {
    return (
      <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: 16,
      }}
    >
      {scans.map((scan) => (
        <article key={scan.id} className="foot-scan-card">
          {scan.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={scan.imageUrl}
              alt={`${scan.side === "left" ? "Left" : "Right"} foot`}
              className="foot-scan-card__image"
            />
          ) : (
            <div className="foot-scan-card__placeholder muted">Image unavailable</div>
          )}
          <div className="foot-scan-card__body">
            <div style={{ fontSize: 16, fontWeight: 700 }}>
              {scan.side === "left" ? "Left foot" : "Right foot"}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {scan.capture_mode ? (
                <Badge tone={captureModeTone(scan.capture_mode)}>
                  {labelCaptureMode(scan.capture_mode)}
                </Badge>
              ) : null}
            </div>
            {scan.arch_type ? (
              <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                Arch profile: <strong>{labelFootType(scan.arch_type)}</strong>
              </p>
            ) : null}
            {hasFootMetrics(scan) ? (
              <div className="foot-scan-metrics">
                <p className="muted" style={{ margin: "0 0 6px", fontSize: 12 }}>
                  Approximate measurements (pending your review):
                </p>
                <dl>
                  <dt>Length</dt>
                  <dd>{formatMm(scan.length_mm)}</dd>
                  <dt>Width</dt>
                  <dd>{formatMm(scan.width_mm)}</dd>
                  <dt>Arch height</dt>
                  <dd>{formatMm(scan.arch_height_mm)}</dd>
                </dl>
              </div>
            ) : scan.capture_mode === "photo_fallback" || scan.capture_mode === "photo" ? (
              <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.4 }}>
                Photo only — no 3D measurements for this foot.
              </p>
            ) : null}
            {scan.meshUrl ? (
              <a
                href={scan.meshUrl}
                download={`${scan.side}-foot-3d-scan.ply`}
                className="foot-scan-download-btn"
              >
                Download 3D scan for lab
              </a>
            ) : hasMeshExport(scan) ? (
              <span className="muted" style={{ fontSize: 12 }}>
                3D file listed but download link expired — refresh the page.
              </span>
            ) : scan.capture_mode === "true_depth" || scan.capture_mode === "rear_lidar" ? (
              <span className="muted" style={{ fontSize: 12 }}>
                No 3D file generated for this scan.
              </span>
            ) : null}
            <div className="muted" style={{ fontSize: 12 }}>
              Captured {formatDate(scan.captured_at)}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
