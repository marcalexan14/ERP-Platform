import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCurrentOrganization } from "@/lib/org";
import { getTranslator } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageForm } from "@/components/dashboard/language-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const org = await getCurrentOrganization(session.user.id);
  if (!org) redirect("/login");

  const t = getTranslator(org.locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("settings_title")}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings_language")}</CardTitle>
          <CardDescription>{t("settings_language_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <LanguageForm currentLocale={org.locale} saveLabel={t("save")} />
        </CardContent>
      </Card>
    </div>
  );
}
