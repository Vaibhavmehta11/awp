import { JobStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface TimelineStep {
  status: JobStatus;
  label: string;
  description: string;
}

const timelineSteps: TimelineStep[] = [
  { status: "SUBMITTED", label: "Submitted", description: "Your brief has been sent" },
  { status: "ACCEPTED", label: "Accepted", description: "Creator accepted your job" },
  { status: "IN_PROGRESS", label: "In Progress", description: "Creator is working on it" },
  { status: "DELIVERED", label: "Delivered", description: "Review and accept the output" },
  { status: "ACCEPTED_BY_BUYER", label: "Completed", description: "Job closed successfully" },
];

const statusOrder: Record<JobStatus, number> = {
  SUBMITTED: 0,
  ACCEPTED: 1,
  IN_PROGRESS: 2,
  DELIVERED: 3,
  REVISION_REQUESTED: 2,
  ACCEPTED_BY_BUYER: 4,
  CANCELLED: -1,
  DISPUTED: -1,
  FAILED: -1,
};

interface JobStatusTimelineProps {
  status: JobStatus;
}

export function JobStatusTimeline({ status }: JobStatusTimelineProps) {
  const currentOrder = statusOrder[status];

  if (currentOrder === -1) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
        This job was {status.toLowerCase().replace("_", " ")}.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-start gap-0">
        {timelineSteps.map((step, idx) => {
          const stepOrder = statusOrder[step.status];
          const isCompleted = currentOrder > stepOrder;
          const isCurrent = currentOrder === stepOrder || (status === "REVISION_REQUESTED" && step.status === "IN_PROGRESS");
          const isUpcoming = currentOrder < stepOrder;

          return (
            <div key={step.status} className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full">
                {idx > 0 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1",
                      isCompleted || isCurrent ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
                <div
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0",
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isCurrent
                      ? "bg-background border-primary text-primary"
                      : "bg-background border-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? "✓" : idx + 1}
                </div>
                {idx < timelineSteps.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1",
                      isCompleted ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
              <div className="mt-2 text-center px-1">
                <p
                  className={cn(
                    "text-xs font-medium",
                    isCurrent ? "text-primary" : isUpcoming ? "text-muted-foreground" : "text-foreground"
                  )}
                >
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
