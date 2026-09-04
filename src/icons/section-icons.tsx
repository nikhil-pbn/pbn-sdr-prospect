import type { IconProps } from "@/types/icons";
import { BusinessAnalyticsIcon } from "@/icons/BusinessAnalytics";
import { DentalMarketingIcon } from "@/icons/DentalMarketing";
import { OperationalEfficiencyIcon } from "@/icons/OperationalEfficiency";
import { PatientRelationshipManagementIcon } from "@/icons/PatientRelationshipManagement";
import { PbnAiIcon } from "@/icons/PbnAi";
import { PbnAiReceptionistIcon } from "@/icons/PbnAiReceptionist";
import { PbnPaymentsIcon } from "@/icons/PbnPayments";
import { PbnVoiceIcon } from "@/icons/PbnVoice";
import { SmartFormsIcon } from "@/icons/SmartForms";

export function SectionIcon({ slug, ...props }: IconProps & { slug: string }) {
  switch (slug) {
    case "patient-relationship-management":
      return <PatientRelationshipManagementIcon {...props} />;
    case "operational-efficiency":
      return <OperationalEfficiencyIcon {...props} />;
    case "pbn-ai":
      return <PbnAiIcon {...props} />;
    case "pbn-voice":
      return <PbnVoiceIcon {...props} />;
    case "dental-marketing":
      return <DentalMarketingIcon {...props} />;
    case "pbn-payments":
      return <PbnPaymentsIcon {...props} />;
    case "smart-forms":
      return <SmartFormsIcon {...props} />;
    case "pbn-ai-receptionist":
      return <PbnAiReceptionistIcon {...props} />;
    case "all-in-one-dental-software":
    case "business-analytics":
    default:
      return <BusinessAnalyticsIcon {...props} />;
  }
}
