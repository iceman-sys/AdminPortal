import { BackLink } from "@/components/BackLink";
import { CopyButton } from "@/components/CopyButton";
import { PageHeader } from "@/components/ui";

export function DetailHeader({
  title,
  subtitle,
  backHref,
  backLabel,
  entityId,
  copyLabel = "Copy ID",
}: {
  title: string;
  subtitle: string;
  backHref: string;
  backLabel: string;
  entityId: string;
  copyLabel?: string;
}) {
  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      actions={
        <>
          <BackLink href={backHref} label={backLabel} />
          <CopyButton value={entityId} label={copyLabel} />
        </>
      }
    />
  );
}
