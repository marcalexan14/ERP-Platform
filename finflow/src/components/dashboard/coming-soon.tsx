import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ComingSoon({ title, phase }: { title: string; phase: string }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Coming in {phase}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This module is on the roadmap — see README.md for the phased build plan.
        </CardContent>
      </Card>
    </div>
  );
}
