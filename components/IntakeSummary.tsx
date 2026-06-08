import { SectionCard } from "@/components/SectionCard";
import { labelActivity, labelFootType, labelPainZones } from "@/lib/labels";
import { formatDate } from "@/components/ui";

type Assessment = {
  foot_type: string | null;
  daily_activity_level: string | null;
  pain_zones: string[] | null;
  created_at: string;
};

export function IntakeSummary({ assessment }: { assessment: Assessment | null }) {
  if (!assessment) {
    return (
      <SectionCard title="Health intake">
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>
          No intake questionnaire on file for this patient.
        </p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Health intake summary">
      <dl className="intake-summary">
        <dt>Foot type (self-reported)</dt>
        <dd>{labelFootType(assessment.foot_type)}</dd>
        <dt>Daily activity</dt>
        <dd>{labelActivity(assessment.daily_activity_level)}</dd>
        <dt>Pain areas</dt>
        <dd>{labelPainZones(assessment.pain_zones)}</dd>
        <dt>Completed</dt>
        <dd>{formatDate(assessment.created_at)}</dd>
      </dl>
    </SectionCard>
  );
}
